import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, XCircle, ArrowRightLeft, WifiOff } from 'lucide-react';
import api from '../services/api';

export default function Notificacoes() {
  const [trocas, setTrocas] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  
  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Usuário';
  const cargoUsuario = localStorage.getItem('cargo_usuario') || '';
  const isSupervisor = cargoUsuario.toLowerCase() === 'supervisor';

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      const [resTrocas, resIncidentes] = await Promise.all([
        api.get('/escalas/trocas'),
        api.get('/incidentes/ativos')
      ]);
      setTrocas(resTrocas.data);
      setIncidentes(resIncidentes.data);
    } catch (e) { console.error(e); }
  };

  const handleResponder = async (id, status) => {
    try {
      await api.put(`/escalas/trocas/${id}`, { status });
      carregarTudo();
    } catch (e) { alert("Erro ao responder."); }
  };

  // Filtra as trocas de escala que este usuário pode ver
  const trocasVisiveis = trocas.filter(t => {
    if (isSupervisor) return true; 
    return t.solicitante === nomeUsuario || t.alvo === nomeUsuario; 
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in-down">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-zinc-900 flex items-center gap-4 tracking-tight">
          <div className="bg-blue-100 p-3 rounded-2xl"><Bell className="w-8 h-8 text-blue-600" /></div>
          Centro de Notificações
        </h1>
        <p className="text-zinc-500 mt-2 text-lg font-medium">Acompanhe alertas do NOC e solicitações de escalas.</p>
      </header>

      <div className="flex flex-col gap-4">
        {/* Renderiza PRIMEIRO os Incidentes do NOC (Prioridade Máxima) */}
        {incidentes.map(inc => (
          <div key={`inc-${inc.id}`} className="p-5 rounded-2xl border bg-red-600 border-red-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full shadow-sm">
                <WifiOff className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <p className="font-black text-sm uppercase tracking-widest text-red-200">ALERTA NOC - {inc.regiao}</p>
                <p className="font-bold text-lg leading-tight">{inc.titulo}</p>
                {inc.descricao && <p className="text-red-100 mt-1 text-sm bg-black/20 p-2 rounded-lg border border-red-500/30">💬 {inc.descricao}</p>}
                <p className="text-xs text-red-300 font-bold mt-2">Enviado por {inc.autor} em {inc.data_hora}</p>
              </div>
            </div>
            {!isSupervisor && (
              <div className="text-xs font-bold text-red-200 uppercase tracking-widest bg-black/20 px-4 py-2 rounded-lg text-center">
                Aguarde normalização
              </div>
            )}
          </div>
        ))}

        {/* Renderiza DEPOIS as Solicitações de Escala */}
        {trocasVisiveis.map(t => {
          const dataFormatada = t.data.split('-').reverse().join('/');
          const souOAlvo = t.alvo === nomeUsuario;
          
          let corCard = "bg-white border-zinc-200";
          let icone = <ArrowRightLeft className="w-6 h-6 text-zinc-400" />;
          let mensagem = "";

          if (t.status === 'pendente') {
            corCard = "bg-yellow-50 border-yellow-200 shadow-md";
            icone = <AlertCircle className="w-6 h-6 text-yellow-600" />;
            if (isSupervisor) mensagem = `${t.solicitante} quer trocar de turno com ${t.alvo} no dia ${dataFormatada}.`;
            else if (souOAlvo) mensagem = `${t.solicitante} quer te passar o turno do dia ${dataFormatada}. Aguardando aprovação da supervisão.`;
            else mensagem = `Seu pedido de troca com ${t.alvo} no dia ${dataFormatada} está em análise.`;
          } 
          else if (t.status === 'aprovada') {
            corCard = "bg-green-50 border-green-200 opacity-80";
            icone = <CheckCircle className="w-6 h-6 text-green-600" />;
            mensagem = `A troca entre ${t.solicitante} e ${t.alvo} (${dataFormatada}) foi APROVADA e a escala atualizada!`;
          } 
          else {
            corCard = "bg-red-50 border-red-200 opacity-80";
            icone = <XCircle className="w-6 h-6 text-red-500" />;
            mensagem = `A troca entre ${t.solicitante} e ${t.alvo} (${dataFormatada}) foi REJEITADA.`;
          }

          return (
            <div key={`troca-${t.id}`} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${corCard}`}>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-full shadow-sm">{icone}</div>
                <p className="text-zinc-800 font-medium">{mensagem}</p>
              </div>
              {isSupervisor && t.status === 'pendente' && (
                <div className="flex gap-2">
                  <button onClick={() => handleResponder(t.id, 'aprovada')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors shadow-sm">Aprovar</button>
                  <button onClick={() => handleResponder(t.id, 'rejeitada')} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-6 rounded-xl text-sm transition-colors">Rejeitar</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Mensagem se tudo estiver vazio */}
        {incidentes.length === 0 && trocasVisiveis.length === 0 && (
          <div className="bg-zinc-50 p-10 rounded-3xl text-center text-zinc-400 font-medium border border-zinc-100 mt-4">
            Você não tem novas notificações no momento.
          </div>
        )}
      </div>
    </div>
  );
}