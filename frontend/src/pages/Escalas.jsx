import React, { useState, useEffect } from 'react';
import { Clock, CalendarDays, CheckCircle, Trash2, UserSearch, Download, Filter, ArrowRightLeft, AlertCircle } from 'lucide-react';
import ExcelJS from 'exceljs';
import api from '../services/api';

export default function Escalas() {
  const [escalas, setEscalas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [trocas, setTrocas] = useState([]); 
  
  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Usuário';
  const cargoUsuario = localStorage.getItem('cargo_usuario') || '';
  const isSupervisor = cargoUsuario.toLowerCase() === 'supervisor';

  // --- Estados do Supervisor ---
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [entrada, setEntrada] = useState('');
  const [almocoInicio, setAlmocoInicio] = useState('');
  const [pausaDois, setPausaDois] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  // --- Estados do Atendente ---
  const [alvoTroca, setAlvoTroca] = useState('');
  const [dataTroca, setDataTroca] = useState('');

  useEffect(() => {
    carregarEscalas();
    carregarUsuarios(); 
    carregarTrocas();
  }, []);

  const carregarEscalas = async () => {
    try { const res = await api.get('/escalas'); setEscalas(res.data); } catch (e) { console.error(e); }
  };
  const carregarUsuarios = async () => {
    try { const res = await api.get('/auth/usuarios'); setUsuarios(res.data); } catch (e) { console.error(e); }
  };
  const carregarTrocas = async () => {
    try { const res = await api.get('/escalas/trocas'); setTrocas(res.data); } catch (e) { console.error(e); }
  };

  const addMins = (timeStr, minsToAdd) => {
    if (!timeStr) return '--:--';
    let [hh, mm] = timeStr.split(':').map(Number);
    let d = new Date(); d.setHours(hh, mm + minsToAdd, 0, 0); return d.toTimeString().slice(0, 5);
  };

  const saida = entrada ? addMins(entrada, 380) : '--:--'; 
  const pre_pausa_1 = almocoInicio ? addMins(almocoInicio, -20) : '--:--'; 
  const almoco_fim = almocoInicio ? addMins(almocoInicio, 40) : '--:--'; 

  // ==========================================
  // FUNÇÕES DO ATENDENTE
  // ==========================================
  const handleSolicitarTroca = async (e) => {
    e.preventDefault();
    if (!alvoTroca || !dataTroca) return alert("Preencha todos os campos.");
    try {
      await api.post('/escalas/trocas', { solicitante: nomeUsuario, alvo: alvoTroca, data: dataTroca });
      alert("✅ Solicitação enviada para a supervisão!");
      carregarTrocas();
      setAlvoTroca(''); setDataTroca('');
    } catch (e) { alert("Erro ao solicitar troca."); }
  };

  // ==========================================
  // FUNÇÕES DO SUPERVISOR
  // ==========================================
  const handleResponderTroca = async (id, status) => {
    try {
      await api.put(`/escalas/trocas/${id}`, { status });
      carregarTrocas(); 
    } catch (e) { alert("Erro ao responder troca."); }
  };

  const handleSalvarEscala = async (e) => {
    e.preventDefault();
    if (!entrada || !almocoInicio || !pausaDois) return alert("Preencha todos os horários.");
    try {
      await api.post('/escalas', { usuario_nome: usuarioSelecionado, data: dataSelecionada, entrada, pre_pausa_1, almoco_inicio: almocoInicio, almoco_fim, pre_pausa_2: pausaDois, saida });
      alert("✅ Turno salvo!"); 
      carregarEscalas();
      setEntrada(''); setAlmocoInicio(''); setPausaDois(''); setUsuarioSelecionado('');
    } catch (e) { alert("Erro ao salvar escala."); }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja remover este turno?")) { await api.delete(`/escalas/${id}`); carregarEscalas(); }
  };

  // ==========================================
  // FILTROS E LÓGICAS DE EXIBIÇÃO
  // ==========================================
  const escalasFiltradas = escalas.filter(esc => {
    const [ano, mes, dia] = esc.data.split('-');
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = dataObj.getDay(); 
    let matchMes = mesFiltro ? mes === mesFiltro : true;
    let matchTipo = tipoFiltro === 'fim_de_semana' ? (diaSemana === 0 || diaSemana === 6) : tipoFiltro === 'dias_uteis' ? (diaSemana > 0 && diaSemana < 6) : true;
    return matchMes && matchTipo;
  });

  const minhasEscalas = escalas.filter(esc => esc.usuario_nome === nomeUsuario);
  const minhasTrocas = trocas.filter(t => t.solicitante === nomeUsuario);

  const exportarPlanilha = async () => {
    if (escalasFiltradas.length === 0) return alert("Não há dados para exportar com estes filtros.");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Escalas');

    worksheet.columns = [
      { key: 'colaborador', width: 22 }, { key: 'inicio', width: 16 }, { key: 'pre1', width: 16 }, 
      { key: 'int_inicio', width: 18 }, { key: 'int_fim', width: 18 }, { key: 'pre2', width: 16 }, { key: 'fim', width: 16 }
    ];

    worksheet.mergeCells('A1:G1');
    const row1 = worksheet.getRow(1);
    row1.height = 20; row1.getCell(1).value = 'ESCALA DE ATENDIMENTO'; row1.getCell(1).font = { bold: true, color: { argb: 'FF000000' } }; row1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } }; row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; row1.getCell(1).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

    worksheet.mergeCells('A2:G2');
    const row2 = worksheet.getRow(2);
    row2.height = 20;
    let tituloData = "GERAL";
    if (tipoFiltro === 'fim_de_semana') tituloData = "FIM DE SEMANA";
    if (tipoFiltro === 'dias_uteis') tituloData = "DIAS ÚTEIS";
    if (mesFiltro) tituloData += ` - MÊS ${mesFiltro}`;

    row2.getCell(1).value = `ESCALA ${tituloData} (SUP. ${nomeUsuario.toUpperCase()})`; row2.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; row2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; row2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; row2.getCell(1).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

    const row3 = worksheet.getRow(3);
    row3.values = ['Colaborador', 'Horário Início', '1ª Pré-Pausa', 'Intervalo Início', 'Intervalo Fim', '2ª Pré-Pausa', 'Horário Fim'];
    row3.height = 30;
    
    const coresCabecalho = ['FFFFFF00', 'FFFFFF00', 'FFFFC000', 'FFFFFF00', 'FFFFFF00', 'FFFFC000', 'FFFFFF00'];
    row3.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FF000000' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coresCabecalho[colNumber - 1] } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    const formatTime = (timeStr) => timeStr ? `${timeStr}:00` : '--:--:00';

    escalasFiltradas.forEach(esc => {
      const row = worksheet.addRow({ colaborador: esc.usuario_nome.toUpperCase(), inicio: formatTime(esc.entrada), pre1: formatTime(esc.pre_pausa_1), int_inicio: formatTime(esc.almoco_inicio), int_fim: formatTime(esc.almoco_fim), pre2: formatTime(esc.pre_pausa_2), fim: formatTime(esc.saida) });
      row.height = 20;
      row.getCell('colaborador').font = { bold: true }; row.getCell('colaborador').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      row.getCell('inicio').font = { bold: true }; row.getCell('inicio').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('inicio').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      row.getCell('pre1').font = { bold: true }; row.getCell('pre1').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('pre1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
      row.getCell('int_inicio').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('int_inicio').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      row.getCell('int_fim').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('int_fim').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      row.getCell('pre2').font = { bold: true }; row.getCell('pre2').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('pre2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
      row.getCell('fim').font = { bold: true }; row.getCell('fim').alignment = { horizontal: 'center', vertical: 'middle' }; row.getCell('fim').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
      row.eachCell({ includeEmpty: true }, (cell) => { cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }; });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let nomeArquivo = "Escala_NovaLink_Formatada"; if (mesFiltro) nomeArquivo += `_Mes_${mesFiltro}`;
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${nomeArquivo}.xlsx`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 flex items-center gap-4 tracking-tight">
          <div className="bg-red-100 p-3 rounded-2xl"><Clock className="w-8 h-8 text-red-600" /></div>
          {isSupervisor ? 'Gestão de Escalas da Equipe' : 'Sua Escala de Trabalho'}
        </h1>
        <p className="text-zinc-500 mt-3 text-lg font-medium ml-1">
          {isSupervisor ? 'Aprove trocas, gere turnos e exporte planilhas formatadas.' : 'Visualize seus horários e solicite trocas de turno com os colegas.'}
        </p>
      </header>

      {/* ========================================================= */}
      {/* V I S Ã O   D O   S U P E R V I S O R                       */}
      {/* ========================================================= */}
      {isSupervisor && (
        <>
          {/* Painel de Alerta de Trocas */}
          {trocas.filter(t => t.status === 'pendente').length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200 mb-10 shadow-sm animate-fade-in-down">
              <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Aprovação de Trocas Pendente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trocas.filter(t => t.status === 'pendente').map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-zinc-700 mb-4">
                      <strong className="text-black">{t.solicitante}</strong> pediu para trocar de turno com <strong className="text-black">{t.alvo}</strong> no dia <strong>{t.data.split('-').reverse().join('/')}</strong>.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleResponderTroca(t.id, 'aprovada')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">Aprovar</button>
                      <button onClick={() => handleResponderTroca(t.id, 'rejeitada')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg text-sm transition-colors">Rejeitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gerador de Escala */}
          <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 mb-10 border-t-4 border-red-600">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2"><CalendarDays className="w-6 h-6 text-red-600" /> Gerador Inteligente de Turno</h2>
            <form onSubmit={handleSalvarEscala} className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Atendente</label>
                <select required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 outline-none" value={usuarioSelecionado} onChange={e => setUsuarioSelecionado(e.target.value)}>
                  <option value="">Selecione o membro...</option>
                  {usuarios.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Data da Escala</label>
                <input type="date" required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 outline-none" value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} />
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-4 border-l-2 border-zinc-100 pl-6">
                <div><label className="text-xs font-bold text-green-700 uppercase">Entrada</label><input type="time" required className="w-full mt-1.5 p-3 border border-green-200 rounded-xl bg-green-50 outline-none text-green-700 font-bold" value={entrada} onChange={e => setEntrada(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-blue-700 uppercase">Alimentação</label><input type="time" required className="w-full mt-1.5 p-3 border border-blue-200 rounded-xl bg-blue-50 outline-none text-blue-700 font-bold" value={almocoInicio} onChange={e => setAlmocoInicio(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-zinc-700 uppercase">2ª Pré-Pausa</label><input type="time" required className="w-full mt-1.5 p-3 border border-zinc-300 rounded-xl bg-zinc-100 outline-none font-bold" value={pausaDois} onChange={e => setPausaDois(e.target.value)} /></div>
              </div>
              <div className="col-span-1 md:col-span-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-wrap justify-between items-center gap-4 mt-2">
                <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">Entrada</p><p className="text-lg font-bold text-green-600">{entrada || '--:--'}</p></div>
                <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">Pré-Pausa 1</p><p className="text-lg font-bold text-zinc-800">{pre_pausa_1}</p></div>
                <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200"><p className="text-[10px] font-black uppercase text-zinc-400">Alimentação (40m)</p><p className="text-lg font-bold text-blue-600">{almocoInicio || '--:--'} às {almoco_fim}</p></div>
                <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">Pré-Pausa 2</p><p className="text-lg font-bold text-zinc-800">{pausaDois || '--:--'}</p></div>
                <div className="text-center bg-red-50 px-4 py-2 rounded-xl border border-red-100"><p className="text-[10px] font-black uppercase text-red-700">Saída (6H20)</p><p className="text-xl font-black text-red-700">{saida}</p></div>
                <button type="submit" className="bg-gradient-to-r from-black to-zinc-800 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"><CheckCircle className="w-5 h-5" /> Salvar Turno</button>
              </div>
            </form>
          </div>

          {/* Barra de Filtros e Exportação do Excel */}
          <div className="bg-white rounded-t-3xl shadow-lg ring-1 ring-zinc-100 p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Filter className="w-5 h-5 text-zinc-500 hidden md:block" />
              <select className="p-2.5 border border-zinc-200 rounded-lg bg-white outline-none font-medium text-zinc-700 shadow-sm" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
                <option value="">Todos os Meses</option>
                <option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option>
                <option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option>
                <option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option>
                <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
              </select>
              <select className="p-2.5 border border-zinc-200 rounded-lg bg-white outline-none font-medium text-zinc-700 shadow-sm" value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
                <option value="todos">Semana Completa</option>
                <option value="dias_uteis">Dias Úteis (Seg - Sex)</option>
                <option value="fim_de_semana">Fins de Semana (Sáb - Dom)</option>
              </select>
            </div>
            <button onClick={exportarPlanilha} className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
              <Download className="w-5 h-5" /> Baixar Planilha (.XLSX)
            </button>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* V I S Ã O   D O   A T E N D E N T E                       */}
      {/* ========================================================= */}
      {!isSupervisor && (
        <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 mb-10 border-t-4 border-blue-600">
          <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2"><ArrowRightLeft className="w-6 h-6 text-blue-600" /> Solicitar Troca de Turno</h2>
          <form onSubmit={handleSolicitarTroca} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Trocar com quem?</label>
              <select required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 outline-none" value={alvoTroca} onChange={e => setAlvoTroca(e.target.value)}>
                <option value="">Selecione o colega...</option>
                {usuarios.filter(u => u.nome !== nomeUsuario).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Para qual data?</label>
              <input type="date" required className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50 outline-none" value={dataTroca} onChange={e => setDataTroca(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md">Enviar Pedido à Supervisão</button>
            </div>
          </form>

          {minhasTrocas.length > 0 && (
            <div className="mt-8 border-t border-zinc-100 pt-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-wider">Status das suas solicitações</h3>
              <div className="flex flex-col gap-3">
                {minhasTrocas.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <p className="text-sm text-zinc-700">Troca com <b>{t.alvo}</b> no dia <b>{t.data.split('-').reverse().join('/')}</b></p>
                    <span className={`px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${t.status === 'aprovada' ? 'bg-green-100 text-green-700' : t.status === 'rejeitada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TABELA COMPARTILHADA                                        */}
      {/* ========================================================= */}
      <div className={`bg-white shadow-lg ring-1 ring-zinc-100 overflow-hidden ${isSupervisor ? 'rounded-b-3xl' : 'rounded-3xl'}`}>
        {!isSupervisor && (
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2"><UserSearch className="w-5 h-5 text-zinc-500" /><h3 className="font-bold text-lg text-zinc-800">Seus Próximos Turnos</h3></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-zinc-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">Colaborador</th>
                <th className="p-4 font-bold">Data</th>
                <th className="p-4 font-bold text-green-700">Entrada</th>
                <th className="p-4 font-bold">Pré-Pausa 1</th>
                <th className="p-4 font-bold text-blue-700">Alimentação</th>
                <th className="p-4 font-bold">Pré-Pausa 2</th>
                <th className="p-4 font-bold text-red-700">Saída</th>
                {isSupervisor && <th className="p-4"></th>}
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-zinc-700">
              {(isSupervisor ? escalasFiltradas : minhasEscalas).map(esc => {
                const [ano, mes, dia] = esc.data.split('-');
                const diaSemanaStr = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
                const isFimDeSemana = diaSemanaStr.includes('SÁB') || diaSemanaStr.includes('DOM');

                return (
                  <tr key={esc.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-bold text-black">{esc.usuario_nome}</td>
                    <td className="p-4 text-zinc-500 flex items-center gap-2">
                      {esc.data.split('-').reverse().join('/')}
                      {isFimDeSemana && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-bold">FDS</span>}
                    </td>
                    <td className="p-4 font-bold text-green-600">{esc.entrada}</td>
                    <td className="p-4">{esc.pre_pausa_1}</td>
                    <td className="p-4 font-bold text-blue-600">{esc.almoco_inicio} às {esc.almoco_fim}</td>
                    <td className="p-4">{esc.pre_pausa_2}</td>
                    <td className="p-4 font-bold text-red-600">{esc.saida}</td>
                    {isSupervisor && (
                      <td className="p-4 text-right">
                        <button onClick={() => handleExcluir(esc.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}