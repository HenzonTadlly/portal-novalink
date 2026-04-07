import React, { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, CheckCircle, Activity, MessageSquare, Download, Filter } from 'lucide-react';
import ExcelJS from 'exceljs';
import api from '../services/api';

export default function Incidentes() {
  const [incidentes, setIncidentes] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [regiao, setRegiao] = useState('');
  
  // Estados para os Filtros
  const dataHoje = new Date().toISOString().split('T')[0];
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroData, setFiltroData] = useState(dataHoje);
  const [filtroMes, setFiltroMes] = useState('');

  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Supervisor';

  useEffect(() => {
    carregarIncidentes();
  }, []);

  const carregarIncidentes = async () => {
    try {
      const res = await api.get('/incidentes');
      setIncidentes(res.data);
    } catch (e) { console.error(e); }
  };

  const handleLancarAlerta = async (e) => {
    e.preventDefault();
    if (!titulo || !regiao) return alert("Preencha título e região.");
    try {
      await api.post('/incidentes', { titulo, descricao, regiao, autor: nomeUsuario });
      alert("🚨 ALERTA LANÇADO PARA AS NOTIFICAÇÕES DO CALL CENTER!");
      setTitulo(''); setDescricao(''); setRegiao('');
      carregarIncidentes();
    } catch (e) { alert("Erro ao lançar alerta."); }
  };

  const handleResolver = async (id) => {
    if (window.confirm("A rede foi normalizada? Isso removerá a notificação vermelha da tela de todos.")) {
      await api.put(`/incidentes/${id}/resolver`);
      carregarIncidentes();
    }
  };

  // ==========================================
  // LÓGICA DE FILTRAGEM
  // ==========================================
  const parseDataBR = (dataBR) => {
    const [dia, mes, ano] = dataBR.split('/');
    return new Date(ano, mes - 1, dia);
  };

  const incidentesFiltrados = incidentes.filter(inc => {
    if (filtroPeriodo === 'todos') return true;
    
    // A data salva no banco está no formato "DD/MM/YYYY às HH:MM:SS"
    const dataIncidenteStr = inc.data_hora.split(' às ')[0]; 
    
    if (filtroPeriodo === 'dia') {
      if (!filtroData) return true;
      const [ano, mes, dia] = filtroData.split('-');
      const dataFiltroBR = `${dia}/${mes}/${ano}`;
      return dataIncidenteStr === dataFiltroBR;
    }
    
    if (filtroPeriodo === 'mes') {
      if (!filtroMes) return true;
      const [, mesInc] = dataIncidenteStr.split('/');
      return mesInc === filtroMes; 
    }

    if (filtroPeriodo === 'semana') {
      const dataInc = parseDataBR(dataIncidenteStr);
      const hoje = new Date();
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);
      return dataInc >= seteDiasAtras && dataInc <= hoje;
    }

    return true;
  });

  // ==========================================
  // LÓGICA DE EXPORTAÇÃO (EXCEL)
  // ==========================================
  const exportarPlanilha = async () => {
    if (incidentesFiltrados.length === 0) return alert("Não há incidentes para exportar com estes filtros.");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Incidentes NOC');

    worksheet.columns = [
      { key: 'status', width: 18 },
      { key: 'data_hora', width: 22 },
      { key: 'motivo', width: 35 },
      { key: 'regiao', width: 25 },
      { key: 'descricao', width: 60 },
      { key: 'autor', width: 20 }
    ];

    // Cabeçalho Principal
    worksheet.mergeCells('A1:F1');
    const row1 = worksheet.getRow(1);
    row1.height = 30;
    
    let tituloFiltro = "TODO O HISTÓRICO";
    if (filtroPeriodo === 'dia') tituloFiltro = `DIA ${filtroData.split('-').reverse().join('/')}`;
    if (filtroPeriodo === 'semana') tituloFiltro = "ÚLTIMOS 7 DIAS";
    if (filtroPeriodo === 'mes') tituloFiltro = `MÊS ${filtroMes}`;

    row1.getCell(1).value = `RELATÓRIO DE INCIDENTES - NovaLink (${tituloFiltro})`;
    row1.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    row1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Vermelho
    row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row1.getCell(1).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

    // Linha de Títulos das Colunas
    const row2 = worksheet.getRow(2);
    row2.values = ['Status', 'Data e Hora', 'Motivo Principal', 'Região / Abrangência', 'Mensagem do NOC', 'Registrado por'];
    row2.height = 25;
    row2.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Vermelho claro
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Inserindo os Dados
    incidentesFiltrados.forEach(inc => {
      const row = worksheet.addRow({
        status: inc.status === 'ativo' ? '🔴 ALERTA ATIVO' : '🟢 RESOLVIDO',
        data_hora: inc.data_hora,
        motivo: inc.titulo,
        regiao: inc.regiao,
        descricao: inc.descricao || 'Nenhuma mensagem repassada.',
        autor: inc.autor
      });
      
      row.alignment = { vertical: 'middle', wrapText: true };
      
      // Bordas para todas as células da linha
      row.eachCell({ includeEmpty: true }, (cell) => { 
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }; 
      });
      
      // Colore o status para ficar bonito no Excel
      const statusCell = row.getCell('status');
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (inc.status === 'ativo') {
        statusCell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Vermelho
      } else {
        statusCell.font = { color: { argb: 'FF16A34A' }, bold: true }; // Verde
      }
    });

    // Gerar e baixar o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob); 
    const link = document.createElement("a"); 
    link.href = url; 
    link.download = `Incidentes_NOC_${tituloFiltro.replace(/ /g, '_')}.xlsx`; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in-down">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 flex items-center gap-4 tracking-tight">
          <div className="bg-red-100 p-3 rounded-2xl"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
          Painel de Incidentes (NOC)
        </h1>
        <p className="text-zinc-500 mt-3 text-lg font-medium ml-1">Lança alertas de rompimento nas Notificações do Call Center em tempo real.</p>
      </header>

      {/* FORMULÁRIO */}
      <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-red-100 mb-10 border-t-8 border-red-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-10 -mr-10 -mt-10 pointer-events-none"></div>
        <h2 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2"><WifiOff className="w-6 h-6" /> Novo Alerta Massivo</h2>
        
        <form onSubmit={handleLancarAlerta} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Motivo Principal</label>
            <input type="text" required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-bold text-zinc-800" placeholder="Ex: Rompimento de Fibra" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Região / Abrangência</label>
            <input type="text" required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-bold text-zinc-800" placeholder="Ex: Picos (Geral) ou Sussuapara..." value={regiao} onChange={e => setRegiao(e.target.value)} />
          </div>
          
          <div className="md:col-span-2 flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-600" /> Mensagem repassada pelo NOC
            </label>
            <textarea required rows="3" className="w-full p-4 border border-red-200 rounded-xl bg-red-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-500 text-red-900 font-medium placeholder-red-300" placeholder="Descreva os detalhes do incidente repassados pelo NOC..." value={descricao} onChange={e => setDescricao(e.target.value)}></textarea>
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 text-lg uppercase tracking-wider">
              <AlertTriangle className="w-6 h-6" /> Disparar para Notificações
            </button>
          </div>
        </form>
      </div>

      {/* BARRA DE FILTROS E EXPORTAÇÃO */}
      <div className="bg-white rounded-t-3xl shadow-lg ring-1 ring-zinc-100 p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-zinc-500 font-bold">
            <Filter className="w-5 h-5" /> <span className="hidden md:inline">Filtrar por:</span>
          </div>
          <select className="p-2.5 border border-zinc-200 rounded-lg bg-white outline-none font-medium text-zinc-700 shadow-sm w-full md:w-auto" value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
            <option value="todos">Todo o Histórico</option>
            <option value="dia">Dia Específico</option>
            <option value="semana">Últimos 7 Dias</option>
            <option value="mes">Mês Específico</option>
          </select>
          
          {filtroPeriodo === 'dia' && (
            <input type="date" className="p-2.5 border border-zinc-200 rounded-lg bg-white outline-none font-medium text-indigo-600 shadow-sm w-full md:w-auto" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
          )}

          {filtroPeriodo === 'mes' && (
            <select className="p-2.5 border border-zinc-200 rounded-lg bg-white outline-none font-medium text-indigo-600 shadow-sm w-full md:w-auto" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
              <option value="">Selecione o mês...</option>
              <option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option>
              <option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option>
              <option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option>
              <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
            </select>
          )}
        </div>
        
        <button onClick={exportarPlanilha} className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
          <Download className="w-5 h-5" /> Baixar Planilha (.XLSX)
        </button>
      </div>

      {/* HISTÓRICO DE INCIDENTES (LISTAGEM) */}
      <div className="bg-white shadow-lg ring-1 ring-zinc-100 overflow-hidden rounded-b-3xl">
        <div className="p-6 flex flex-col gap-4">
          {incidentesFiltrados.length === 0 ? (
            <p className="text-center text-zinc-400 font-medium py-10">Nenhum incidente encontrado para este filtro.</p>
          ) : (
            incidentesFiltrados.map(inc => (
              <div key={inc.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${inc.status === 'ativo' ? 'bg-red-50 border-red-200' : 'bg-white border-zinc-200 opacity-70 hover:bg-zinc-50'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${inc.status === 'ativo' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                      {inc.status === 'ativo' ? '🔴 ALERTA ATIVO NAS NOTIFICAÇÕES' : '🟢 RESOLVIDO'}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">{inc.data_hora}</span>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900">{inc.titulo} <span className="text-red-500 font-black">({inc.regiao})</span></h4>
                  {inc.descricao && <p className="text-sm text-zinc-600 mt-2 font-medium bg-zinc-100 p-3 rounded-lg border border-zinc-200 shadow-inner block">💬 NOC: {inc.descricao}</p>}
                  <p className="text-xs text-zinc-400 mt-3 font-medium">Lançado por: {inc.autor}</p>
                </div>

                {inc.status === 'ativo' && (
                  <button onClick={() => handleResolver(inc.id)} className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-md">
                    <CheckCircle className="w-5 h-5" /> Normalizar Rede
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}