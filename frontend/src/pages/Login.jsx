import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Lock, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await api.post('/auth/login', { matricula, senha });
      
      // Salva os dados no navegador
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('nome_usuario', response.data.nome);
      localStorage.setItem('cargo_usuario', response.data.cargo);
      localStorage.setItem('foto_perfil', response.data.foto_perfil); // Salva a foto para o menu!

      // A MÁGICA ACONTECE AQUI: Redireciona para o novo Dashboard!
      navigate('/home');
      
    } catch (error) {
      if (error.response && error.response.data.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro('Erro ao conectar com o servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    // Fundo escuro premium para dar contraste com o card branco
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-4 font-sans text-zinc-800">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-down">
        
        {/* Cabeçalho do Login */}
        <div className="p-10 border-b border-zinc-100 flex flex-col items-center justify-center text-center bg-zinc-50/50">
          <div className="bg-red-100 p-4 rounded-2xl mb-4">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Portal <span className="text-red-600">NovaLink</span></h1>
          <p className="text-zinc-500 font-medium mt-2">Acesse com sua matrícula e senha</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="p-10 flex flex-col gap-6">
          
          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-100">
              {erro}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <input 
              type="text" 
              required 
              placeholder="Sua Matrícula" 
              className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-black"
              value={matricula} 
              onChange={e => setMatricula(e.target.value)} 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-400" />
            </div>
            <input 
              type="password" 
              required 
              placeholder="Sua Senha" 
              className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-black"
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-[0_4px_14px_rgba(220,38,38,0.4)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {carregando ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar no Portal'}
          </button>
          
        </form>
      </div>
    </div>
  );
}