import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Users, Calculator, ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [artigos, setArtigos] = useState([]);
  const [escalasHoje, setEscalasHoje] = useState(0);
  const [minhaEscalaHoje, setMinhaEscalaHoje] = useState(null);
  
  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Usuário';
  const cargoUsuario = localStorage.getItem('cargo_usuario') || '';

  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? 'Bom dia' : horaAtual < 18 ? 'Boa tarde' : 'Boa noite';
  const dataHojeFormatada = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    try {
      const resWiki = await api.get('/wiki');
      setArtigos(resWiki.data);

      const resEscalas = await api.get('/escalas');
      const dataLocal = new Date();
      const offset = dataLocal.getTimezoneOffset() * 60000;
      const dataHojeApi = new Date(dataLocal.getTime() - offset).toISOString().split('T')[0];
      
      const escaladosHoje = resEscalas.data.filter(esc => esc.data === dataHojeApi);
      setEscalasHoje(escaladosHoje.length);

      // Procura se o usuário logado está escalado hoje
      const minhaEscala = escaladosHoje.find(esc => esc.usuario_nome === nomeUsuario);
      setMinhaEscalaHoje(minhaEscala);

    } catch (error) { console.error("Erro ao carregar os dados", error); }
  };

  const ultimosArtigos = [...artigos].reverse().slice(0, 3);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in-down">
      
      <header className="mb-10 bg-gradient-to-r from-black to-zinc-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[80px] opacity-40 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-500 rounded-full blur-[60px] opacity-20 -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-bold tracking-widest uppercase text-xs mb-3">
              <Sparkles className="w-4 h-4" /> Painel de Controle
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              {saudacao}, <span className="text-red-500">{nomeUsuario.split(' ')[0]}</span>!
            </h1>
            <p className="text-zinc-300 text-lg max-w-xl">
              Este é o resumo da sua operação para <span className="text-white font-bold capitalize">{dataHojeFormatada}</span>.
            </p>
          </div>
          
          {/* LÓGICA DO CARD DO CABEÇALHO */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
            <div className={cargoUsuario.toLowerCase() === 'supervisor' ? "bg-red-500 p-3 rounded-xl" : "bg-green-500 p-3 rounded-xl"}>
              {cargoUsuario.toLowerCase() === 'supervisor' ? <Users className="w-7 h-7 text-white" /> : <Clock className="w-7 h-7 text-white" />}
            </div>
            <div>
              {cargoUsuario.toLowerCase() === 'supervisor' ? (
                <>
                  <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Equipe Escalada Hoje</p>
                  <p className="text-3xl font-black text-white">{escalasHoje} <span className="text-lg font-medium text-zinc-400">pessoas</span></p>
                </>
              ) : (
                <>
                  <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Seu Turno Hoje</p>
                  {minhaEscalaHoje ? (
                     <p className="text-2xl font-black text-white">{minhaEscalaHoje.entrada} <span className="text-sm font-medium text-zinc-400">às</span> {minhaEscalaHoje.saida}</p>
                  ) : (
                     <p className="text-xl font-bold text-zinc-400 mt-1">Dia de Folga</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CARDS RÁPIDOS (Omitido por brevidade, pode manter o restante igual da tela Home) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/wiki" className="bg-white p-6 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-xl hover:-translate-y-1 hover:ring-red-200 transition-all group flex flex-col justify-between h-48">
          <div className="flex justify-between items-start">
            <div className="bg-red-50 p-3 rounded-xl group-hover:bg-red-600 transition-colors"><BookOpen className="w-7 h-7 text-red-600 group-hover:text-white transition-colors" /></div>
            <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" />
          </div>
          <div><h3 className="text-2xl font-black text-zinc-800 mb-1">Wiki NovaLink</h3><p className="text-zinc-500 font-medium">Você tem <span className="text-red-600 font-bold">{artigos.length} artigos</span> na base.</p></div>
        </Link>

        <Link to="/calculadora" className="bg-white p-6 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-xl hover:-translate-y-1 hover:ring-zinc-300 transition-all group flex flex-col justify-between h-48">
          <div className="flex justify-between items-start">
            <div className="bg-zinc-100 p-3 rounded-xl group-hover:bg-black transition-colors"><Calculator className="w-7 h-7 text-zinc-700 group-hover:text-white transition-colors" /></div>
            <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-black transition-colors" />
          </div>
          <div><h3 className="text-2xl font-black text-zinc-800 mb-1">Calculadoras</h3><p className="text-zinc-500 font-medium">Resolva cálculos rápidos.</p></div>
        </Link>

        <Link to="/escalas" className="bg-white p-6 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-xl hover:-translate-y-1 hover:ring-green-200 transition-all group flex flex-col justify-between h-48">
          <div className="flex justify-between items-start">
            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-600 transition-colors"><Clock className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" /></div>
            <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-green-600 transition-colors" />
          </div>
          <div><h3 className="text-2xl font-black text-zinc-800 mb-1">{cargoUsuario.toLowerCase() === 'supervisor' ? 'Gestão de Escalas' : 'Minhas Escalas'}</h3><p className="text-zinc-500 font-medium">Visualize horários e pausas.</p></div>
        </Link>
      </div>
    </div>
  );
}