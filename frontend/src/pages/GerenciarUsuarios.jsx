import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cargo, setCargo] = useState('atendente');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      alert("Erro ao carregar lista de usuários.");
    }
  };

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        // Atualizar usuário existente
        await api.put(`/auth/usuarios/${editandoId}`, { nome, matricula, cargo, senha });
        alert("✅ Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário (A senha é obrigatória aqui)
        if (!senha) return alert("A senha é obrigatória para novos usuários!");
        await api.post('/auth/registrar', { nome, matricula, cargo, senha });
        alert("✅ Novo usuário cadastrado!");
      }
      
      limparFormulario();
      carregarUsuarios();
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao salvar usuário.");
    }
  };

  const handleEditar = (user) => {
    setEditandoId(user.id);
    setNome(user.nome);
    setMatricula(user.matricula);
    setCargo(user.cargo);
    setSenha(''); // Deixa a senha em branco, só atualiza se ele digitar algo
    setMostrarForm(true);
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja EXCLUIR o usuário ${nome}? Isso não pode ser desfeito.`)) {
      try {
        await api.delete(`/auth/usuarios/${id}`);
        carregarUsuarios();
      } catch (error) {
        alert("Erro ao excluir usuário.");
      }
    }
  };

  const limparFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setNome(''); setMatricula(''); setCargo('atendente'); setSenha('');
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            Gestão de Equipe
          </h1>
          <p className="text-zinc-500 mt-2">Crie, edite ou remova acessos do Portal NovaLink.</p>
        </div>
        <button 
          onClick={() => { limparFormulario(); setMostrarForm(!mostrarForm); }}
          className="bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          {mostrarForm ? 'Cancelar' : <><UserPlus className="w-5 h-5" /> Adicionar Usuário</>}
        </button>
      </header>

      {mostrarForm && (
        <form onSubmit={handleSalvarUsuario} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">Nome Completo</label>
            <input type="text" required value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2.5 border rounded-lg bg-zinc-50 outline-none focus:ring-2 focus:ring-red-600" />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">Matrícula (Login)</label>
            <input type="text" required value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full p-2.5 border rounded-lg bg-zinc-50 outline-none focus:ring-2 focus:ring-red-600" />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">Cargo / Nível de Acesso</label>
            <select value={cargo} onChange={e => setCargo(e.target.value)} className="w-full p-2.5 border rounded-lg bg-zinc-50 outline-none focus:ring-2 focus:ring-red-600">
              <option value="atendente">Atendente (Leitura)</option>
              <option value="supervisor">Supervisor (Acesso Total)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">
              {editandoId ? 'Nova Senha (Opcional)' : 'Senha de Acesso'}
            </label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required={!editandoId} placeholder={editandoId ? "Deixe em branco para não mudar" : ""} className="w-full p-2.5 border rounded-lg bg-zinc-50 outline-none focus:ring-2 focus:ring-red-600" />
          </div>
          <div className="lg:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors">
              {editandoId ? 'Atualizar Cadastro' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-zinc-600 text-sm uppercase tracking-wider border-b border-zinc-200">
              <th className="p-4">Nome</th>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Nível de Acesso</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <td className="p-4 font-bold text-black flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" /> {user.nome}
                </td>
                <td className="p-4 text-zinc-600">{user.matricula}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.cargo.toLowerCase() === 'supervisor' ? 'bg-red-100 text-red-700' : 'bg-zinc-200 text-zinc-700'}`}>
                    {user.cargo}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEditar(user)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Editar Usuário">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleExcluir(user.id, user.nome)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Excluir Usuário">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}