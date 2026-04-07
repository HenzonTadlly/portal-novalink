import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Calculator, LogOut, UserCircle, Menu, ChevronLeft, Users, Camera, Clock, LayoutDashboard, Bell, AlertTriangle, ClipboardList } from 'lucide-react';
import api from '../services/api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(true);

  const nomeUsuario = localStorage.getItem('nome_usuario') || 'Usuário';
  const cargoUsuario = localStorage.getItem('cargo_usuario') || 'atendente';
  
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem('foto_perfil') || null);
  const [fazendoUpload, setFazendoUpload] = useState(false);

  // =================================================================
  // LÓGICA DO SININHO (CONTA TROCAS + INCIDENTES DO NOC)
  // =================================================================
  const [qtdNotificacoes, setQtdNotificacoes] = useState(0);

  useEffect(() => {
    const buscarNotificacoes = async () => {
      try {
        // Busca as trocas e os incidentes ao mesmo tempo
        const [resTrocas, resIncidentes] = await Promise.all([
          api.get('/escalas/trocas'),
          api.get('/incidentes/ativos')
        ]);

        const pendentes = resTrocas.data.filter(t => t.status === 'pendente');
        const incidentesAtivos = resIncidentes.data.length; // Conta quantos incidentes estão vermelhos
        
        if (cargoUsuario.toLowerCase() === 'supervisor') {
          setQtdNotificacoes(pendentes.length + incidentesAtivos); // Chefe vê todas as pendentes + incidentes
        } else {
          const pendentesPraMim = pendentes.filter(t => t.alvo === nomeUsuario).length;
          setQtdNotificacoes(pendentesPraMim + incidentesAtivos); // Atendente vê as trocas para ele + incidentes
        }
      } catch (error) {}
    };
    
    buscarNotificacoes(); 
    const intervalo = setInterval(buscarNotificacoes, 5000); 
    return () => clearInterval(intervalo);
  }, [cargoUsuario, nomeUsuario]);


  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    formData.append('nome', nomeUsuario);

    try {
      setFazendoUpload(true);
      const res = await api.post('/auth/foto', formData);
      const novaFoto = res.data.foto_perfil;
      setFotoPerfil(novaFoto);
      localStorage.setItem('foto_perfil', novaFoto); 
    } catch (error) {
      alert("Erro ao enviar a fotografia de perfil.");
    } finally {
      setFazendoUpload(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 overflow-hidden font-sans text-zinc-800">
      
      <aside className={`${menuAberto ? 'w-64' : 'w-20'} bg-black text-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-20 transition-all duration-300 relative`}>
        <div className={`p-5 border-b border-zinc-800/50 flex items-center ${menuAberto ? 'justify-between' : 'justify-center'}`}>
          {menuAberto ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-red-600/20 p-2 rounded-lg">
                  <BookOpen className="w-7 h-7 text-red-500 shrink-0" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight whitespace-nowrap">Portal <span className="text-red-500">NovaLink</span></h1>
              </div>
              <button onClick={() => setMenuAberto(false)} className="text-zinc-500 hover:text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            </>
          ) : (
            <button onClick={() => setMenuAberto(true)} className="text-zinc-500 hover:text-white transition-colors"><Menu className="w-7 h-7" /></button>
          )}
        </div>

        <div className={`p-5 border-b border-zinc-800/50 flex items-center gap-4 overflow-hidden ${!menuAberto && 'justify-center'}`}>
          <div className="relative group cursor-pointer" title="Trocar fotografia de perfil">
            <label htmlFor="upload-foto" className="cursor-pointer block relative">
              {fotoPerfil && fotoPerfil !== 'null' && fotoPerfil !== 'undefined' ? (
                <img src={`http://localhost:3333/uploads/${fotoPerfil}`} alt="Perfil" className="w-11 h-11 rounded-full object-cover border-2 border-zinc-700 group-hover:border-red-500 transition-colors" />
              ) : (
                <UserCircle className="w-11 h-11 text-zinc-400 shrink-0 group-hover:text-red-400 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-4 h-4 text-white" /></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            </label>
            <input id="upload-foto" type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={fazendoUpload} />
          </div>
          {menuAberto && (
            <div className="whitespace-nowrap flex flex-col justify-center">
              <p className="font-bold text-sm truncate leading-tight">{nomeUsuario}</p>
              <p className="text-[11px] text-red-400 uppercase font-black tracking-widest mt-0.5">{cargoUsuario}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-3 mt-2 overflow-y-auto custom-scrollbar">
          <Link to="/home" title="Início" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/home' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Início</span>}
          </Link>

          <Link to="/wiki" title="Base de Conhecimento" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/wiki' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
            <BookOpen className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Base de Conhecimento</span>}
          </Link>

          <Link to="/calculadora" title="Calculadora" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/calculadora' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
            <Calculator className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Calculadoras</span>}
          </Link>

          <Link to="/escalas" title="Escalas" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/escalas' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
            <Clock className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">{cargoUsuario.toLowerCase() === 'supervisor' ? 'Gestão de Escalas' : 'Minha Escala'}</span>}
          </Link>

          {/* O SININHO COM O BADGE ATUALIZADO */}
          <Link to="/notificacoes" title="Notificações" className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/notificacoes' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 shrink-0" />
                {qtdNotificacoes > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-black">
                    {qtdNotificacoes}
                  </span>
                )}
              </div>
              {menuAberto && <span className="whitespace-nowrap">Notificações</span>}
            </div>
          </Link>

          {cargoUsuario && cargoUsuario.toLowerCase() === 'supervisor' && (
            <>
              <Link to="/incidentes" title="NOC / Incidentes" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/incidentes' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
                <AlertTriangle className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">NOC / Incidentes</span>}
              </Link>
              
              <Link to="/diario" title="Diário de Bordo" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/diario' ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
                <ClipboardList className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Diário de Bordo</span>}
              </Link>

              <Link to="/usuarios" title="Gestão de Equipa" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${location.pathname === '/usuarios' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'} ${!menuAberto && 'justify-center px-0'}`}>
                <Users className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Gestão de Equipa</span>}
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button onClick={handleLogout} title="Terminar Sessão" className={`flex items-center gap-2 w-full bg-zinc-900/50 hover:bg-red-600 text-zinc-300 hover:text-white px-4 py-3.5 rounded-xl transition-all duration-300 font-bold border border-zinc-800 overflow-hidden ${!menuAberto && 'justify-center px-0'}`}>
            <LogOut className="w-5 h-5 shrink-0" /> {menuAberto && <span className="whitespace-nowrap">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto transition-all duration-300 bg-zinc-50 relative flex flex-col">
        {/* O BANNER FOI REMOVIDO DAQUI! 🎉 */}
        <Outlet /> 
      </main>
    </div>
  );
}