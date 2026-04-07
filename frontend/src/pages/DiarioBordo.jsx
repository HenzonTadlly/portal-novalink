import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Users, Activity, CheckCircle, Trash2, Filter, Clock } from 'lucide-react';
import api from '../services/api';

export default function DiarioBordo() {
  const [diario, setDiario] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  
  const dataHoje = new Date().toISOString().split('T')[0];
  const [dataFiltro, setDataFiltro] = useState(dataHoje);

  // Estados do Formulário
  const [mensagem, setMensagem] = useState('');
  const [pessoasAfetadas, setPessoasAfetadas] = useState('');
  const [isOscilacao, setIsOscilacao] = useState(false);
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioNormalizacao, setHorarioNormalizacao] = useState('');
  const [dataRegistro, setDataRegistro] = useState(dataHoje);
  
  // Novos estados para o tipo de Oscilação
  const [tipoOscilacao, setTipoOscilacao] = useState('geral');
  const [cidadeOscilacao, setCidadeOscilacao] = useState('');

  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Supervisor';

  useEffect(() => {
    carregarDiario();
    carregarIncidentes();
  }, []);

  const carregarDiario = async () => {
    try { const res = await api.get('/diario'); setDiario(res.data); } catch (e) { console.error(e); }
  };

  const carregarIncidentes = async () => {
    try { const res = await api.get('/incidentes'); setIncidentes(res.data); } catch (e) { console.error(e); }
  };

  const handleSalvarRegistro = async (e) => {
    e.preventDefault();
    
    // Validações Inteligentes
    if (!isOscilacao && !pessoasAfetadas) return alert("Preencha a quantidade de pessoas afetadas!");
    if (isOscilacao && tipoOscilacao === 'cidade' && !cidadeOscilacao) return alert("Informe qual cidade sofreu a oscilação!");
    if (isOscilacao && (!horarioInicio || !horarioNormalizacao)) return alert("Preencha os horários de início e normalização da oscilação!");

    // Formata a mensagem com a tag de oscilação automaticamente
    let mensagemFinal = mensagem;
    if (isOscilacao) {
        const detalhe = tipoOscilacao === 'geral' ? 'GERAL' : cidadeOscilacao.toUpperCase();
        mensagemFinal = `[OSCILAÇÃO ${detalhe}] ${mensagem}`;
    }

    try {
      await api.post('/diario', {
        mensagem: mensagemFinal,
        pessoas_afetadas: isOscilacao ? 0 : pessoasAfetadas, // Manda 0 pro banco se for oscilação
        is_oscilacao: isOscilacao,
        horario_inicio: isOscilacao ? horarioInicio : null,
        horario_normalizacao: isOscilacao ? horarioNormalizacao : null,
        data_registro: dataRegistro,
        autor: nomeUsuario
      });
      alert("✅ Relatório salvo no Diário de Bordo!");
      
      // Limpa tudo após salvar
      setMensagem(''); 
      setPessoasAfetadas(''); 
      setIsOscilacao(false); 
      setHorarioInicio(''); 
      setHorarioNormalizacao('');
      setCidadeOscilacao('');
      setTipoOscilacao('geral');
      
      carregarDiario();
    } catch (e) { alert("Erro ao salvar no diário."); }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Remover este registo do Diário?")) {
      await api.delete(`/diario/${id}`);
      carregarDiario();
    }
  };

  const diarioFiltrado = diario.filter(d => d.data_registro === dataFiltro);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in-down">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 flex items-center gap-4 tracking-tight">
            <div className="bg-indigo-100 p-3 rounded-2xl"><ClipboardList className="w-8 h-8 text-indigo-600" /></div>
            Diário de Bordo
          </h1>
          <p className="text-zinc-500 mt-3 text-lg font-medium ml-1">Registo diário de incidentes, impactos e oscilações na rede.</p>
        </div>
      </header>

      {/* FORMULÁRIO DO DIÁRIO */}
      <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 mb-10 border-t-4 border-indigo-600">
        <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-600" /> Novo Registo no Diário</h2>
        
        <form onSubmit={handleSalvarRegistro} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Data do Ocorrido</label>
            <input type="date" required className="w-full mt-1.5 p-3 border border-zinc-200 rounded-xl bg-zinc-50 outline-none font-medium" value={dataRegistro} onChange={e => setDataRegistro(e.target.value)} />
          </div>

          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
              <span>Incidente (Mensagem do NOC)</span>
              <select className="text-indigo-600 bg-transparent outline-none font-bold text-xs cursor-pointer" onChange={e => { if(e.target.value) setMensagem(e.target.value) }}>
                <option value="">+ Puxar histórico do NOC</option>
                {incidentes.map(inc => <option key={inc.id} value={`${inc.titulo} (${inc.regiao}): ${inc.descricao}`}>{inc.titulo} - {inc.regiao}</option>)}
              </select>
            </label>
            <textarea required rows="2" className="w-full p-3 border border-zinc-200 rounded-xl bg-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Descreva o incidente ou selecione acima..." value={mensagem} onChange={e => setMensagem(e.target.value)}></textarea>
          </div>

          {/* ÁREA DINÂMICA: Muda dependendo se é oscilação ou não */}
          <div className="md:col-span-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col gap-5">
            <label className="flex items-center gap-3 cursor-pointer font-black text-lg text-zinc-800 border-b border-zinc-200 pb-4">
              <input type="checkbox" className="w-6 h-6 accent-indigo-600" checked={isOscilacao} onChange={e => setIsOscilacao(e.target.checked)} />
              Houve Oscilação no LINK?
            </label>
            
            {isOscilacao ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-down">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Abrangência</label>
                  <select className="w-full mt-1 p-3 border border-zinc-300 rounded-xl outline-none font-bold bg-white" value={tipoOscilacao} onChange={e => setTipoOscilacao(e.target.value)}>
                    <option value="geral">Geral (Todo o Link)</option>
                    <option value="cidade">Cidade Específica</option>
                  </select>
                </div>
                
                {tipoOscilacao === 'cidade' && (
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Qual Cidade?</label>
                    <input type="text" required placeholder="Ex: Picos" className="w-full mt-1 p-3 border border-zinc-300 rounded-xl bg-white outline-none font-bold text-indigo-700" value={cidadeOscilacao} onChange={e => setCidadeOscilacao(e.target.value)} />
                  </div>
                )}

                <div className="md:col-span-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Horário Início</label>
                  <input type="time" required className="w-full mt-1 p-3 border border-zinc-300 rounded-xl bg-white outline-none font-bold" value={horarioInicio} onChange={e => setHorarioInicio(e.target.value)} />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500">Normalização</label>
                  <input type="time" required className="w-full mt-1 p-3 border border-zinc-300 rounded-xl bg-white outline-none font-bold" value={horarioNormalizacao} onChange={e => setHorarioNormalizacao(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="w-full md:w-1/3 animate-fade-in-down">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Users className="w-4 h-4"/> Pessoas Afetadas (Qtd)</label>
                <input type="number" min="0" required className="w-full mt-1.5 p-3.5 border border-zinc-300 rounded-xl bg-white outline-none text-lg font-bold text-red-600 shadow-sm" placeholder="Ex: 1500" value={pessoasAfetadas} onChange={e => setPessoasAfetadas(e.target.value)} />
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all flex items-center gap-2 shadow-lg text-lg">
              <CheckCircle className="w-6 h-6" /> Salvar no Diário
            </button>
          </div>
        </form>
      </div>

      {/* ÁREA DE FILTRO E LISTAGEM */}
      <div className="bg-white rounded-3xl shadow-lg ring-1 ring-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-500" />
            <h3 className="font-bold text-lg text-zinc-800">Registos do Dia</h3>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-600 uppercase">Filtrar Data:</span>
            <input type="date" className="outline-none font-bold text-indigo-600 bg-transparent" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} />
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {diarioFiltrado.length === 0 ? (
            <div className="text-center text-zinc-400 font-medium py-10">Nenhum registo encontrado para o dia {dataFiltro.split('-').reverse().join('/')}.</div>
          ) : (
            diarioFiltrado.map(d => (
              <div key={d.id} className="p-5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-zinc-800 font-bold text-lg mb-2">{d.mensagem}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {/* Renderiza diferente se foi oscilação ou pessoas afetadas */}
                    {d.is_oscilacao === 1 ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                        <Clock className="w-4 h-4"/> Oscilação no Link: {d.horario_inicio} às {d.horario_normalizacao}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                        <Users className="w-4 h-4"/> {d.pessoas_afetadas} Afetados
                      </span>
                    )}
                    
                    <span className="text-xs text-zinc-400 font-bold bg-zinc-100 px-3 py-1 rounded-lg">Autor: {d.autor}</span>
                  </div>
                </div>
                
                <button onClick={() => handleExcluir(d.id)} className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-colors self-start md:self-center">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}