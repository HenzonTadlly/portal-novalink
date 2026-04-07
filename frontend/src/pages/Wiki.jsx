import React, { useEffect, useState } from 'react';
import { Search, PlusCircle, BookOpen, Key, FileText, Settings, DollarSign, List, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Wiki() {
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [artigos, setArtigos] = useState([]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('Todas');
  
  // Controle do Formulário
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);

  const abasDisponiveis = ['Todas', 'Senhas', 'Protocolos', 'Serviços', 'Planos', 'Outros'];

  useEffect(() => {
    setCargoUsuario(localStorage.getItem('cargo_usuario') || '');
    carregarArtigos();
  }, []);

  const carregarArtigos = async () => {
    try {
      const response = await api.get('/wiki');
      setArtigos(response.data);
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
    }
  };

  const handleSalvarArtigo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('categoria', novaCategoria);
      formData.append('titulo', novoTitulo);
      formData.append('conteudo', novoConteudo);
      if (novaImagem) formData.append('imagem', novaImagem);

      if (editandoId) {
        await api.put(`/wiki/${editandoId}`, formData);
        alert("✅ Artigo atualizado com sucesso!");
      } else {
        await api.post('/wiki', formData);
        alert("✅ Artigo salvo com sucesso!");
      }
      
      limparFormulario();
      carregarArtigos();
    } catch (error) {
      alert("Erro ao salvar artigo.");
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este artigo definitivamente?")) {
      try {
        await api.delete(`/wiki/${id}`);
        carregarArtigos();
      } catch (error) {
        alert("Erro ao excluir o artigo.");
      }
    }
  };

  const handleEditar = (artigo) => {
    setEditandoId(artigo.id);
    setNovaCategoria(artigo.categoria);
    setNovoTitulo(artigo.titulo);
    setNovoConteudo(artigo.conteudo);
    setNovaImagem(null);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setNovaCategoria('');
    setNovoTitulo('');
    setNovoConteudo('');
    setNovaImagem(null);
  };

  const resultadosFiltrados = artigos.filter((item) => {
    const matchAba = abaAtiva === 'Todas' || 
                     (abaAtiva === 'Outros' && !abasDisponiveis.includes(item.categoria)) ||
                     item.categoria?.toLowerCase() === abaAtiva.toLowerCase();
    
    const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       item.conteudo.toLowerCase().includes(busca.toLowerCase()) ||
                       item.categoria.toLowerCase().includes(busca.toLowerCase());
    
    return matchAba && matchBusca;
  });

  const getCategoriaEstilo = (categoria) => {
    const cat = categoria?.toLowerCase() || '';
    if (cat.includes('senha')) return { cor: 'bg-red-100 text-red-700 border-red-200', icone: <Key className="w-4 h-4" /> };
    if (cat.includes('protocolo')) return { cor: 'bg-zinc-200 text-zinc-800 border-zinc-300', icone: <FileText className="w-4 h-4" /> };
    if (cat.includes('serviço') || cat.includes('plano')) return { cor: 'bg-green-100 text-green-800 border-green-300', icone: <DollarSign className="w-4 h-4" /> };
    return { cor: 'bg-black text-white border-black', icone: <List className="w-4 h-4" /> };
  };

  return (
    <div className="p-8">
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-black flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-red-600" />
          Base de Conhecimento
        </h1>
        <p className="text-zinc-500 mt-2">Encontre protocolos, senhas padrões e valores de serviços.</p>
      </header>

      {/* Barra de Pesquisa */}
      <div className="relative mb-6 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-zinc-400 group-focus-within:text-red-600 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder={`Pesquisar na aba "${abaAtiva}"...`} 
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-transparent bg-white shadow-sm rounded-xl focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all duration-300"
          value={busca} 
          onChange={(e) => setBusca(e.target.value)} 
        />
      </div>

      {/* Menu de Abas */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-zinc-200">
        {abasDisponiveis.map((aba) => (
          <button key={aba} onClick={() => setAbaAtiva(aba)} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex-1 sm:flex-none text-center ${abaAtiva === aba ? 'bg-red-600 text-white shadow-md transform scale-105' : 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}>
            {aba}
          </button>
        ))}
      </div>

      {/* Área da Supervisão */}
      {cargoUsuario && cargoUsuario.toLowerCase() === 'supervisor' && (
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-black">{editandoId ? 'Editando Artigo' : 'Painel da Supervisão'}</h3>
              <p className="text-sm text-zinc-500">{editandoId ? 'Altere as informações abaixo e clique em salvar.' : 'Adicione novos procedimentos na base.'}</p>
            </div>
            
            {/* BOTÃO CORRIGIDO AQUI! */}
            <button 
              onClick={() => {
                if (mostrarForm) {
                  limparFormulario();
                } else {
                  limparFormulario();
                  setMostrarForm(true);
                }
              }} 
              className={`flex items-center gap-2 font-bold py-2 px-5 rounded-lg transition-all ${mostrarForm ? 'bg-zinc-200 text-black hover:bg-zinc-300' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
            >
              {mostrarForm ? <Settings className="w-5 h-5 animate-spin-slow" /> : <PlusCircle className="w-5 h-5 hover:scale-110 transition-transform" />}
              {mostrarForm ? "Cancelar" : "Novo Artigo"}
            </button>
          </div>

          {mostrarForm && (
            <form onSubmit={handleSalvarArtigo} className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <select required className="w-1/3 border border-zinc-300 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none bg-zinc-50 font-medium" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)}>
                  <option value="" disabled>Selecione a Categoria</option>
                  <option value="Senhas">Senhas / Usuários</option>
                  <option value="Protocolos">Protocolos de Atendimento</option>
                  <option value="Serviços">Valores de Serviços</option>
                  <option value="Planos">Planos e Banners</option>
                  <option value="Outros">Outras Orientações</option>
                </select>
                <input type="text" placeholder="Título do Artigo" required className="w-2/3 border border-zinc-300 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none bg-zinc-50" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />
              </div>
              
              <textarea placeholder="Insira as informações aqui..." required className="w-full border border-zinc-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-red-600 outline-none resize-none bg-zinc-50" value={novoConteudo} onChange={e => setNovoConteudo(e.target.value)}></textarea>
              
              <div className="flex flex-col gap-2 mt-2 mb-4">
                <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" /> {editandoId ? 'Atualizar Imagem (Deixe vazio para manter a atual)' : 'Adicionar Banner ou Imagem (Opcional)'}
                </label>
                <input type="file" accept="image/*" onChange={e => setNovaImagem(e.target.files[0])} className="border border-zinc-300 p-2 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
              </div>

              <button type="submit" className={`font-bold py-3 rounded-lg transition-colors text-white ${editandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-zinc-800'}`}>
                {editandoId ? 'Atualizar Informações' : 'Salvar na Base'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultadosFiltrados.length > 0 ? (
          resultadosFiltrados.map((item) => {
            const estilo = getCategoriaEstilo(item.categoria);
            return (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-red-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
                
                {cargoUsuario && cargoUsuario.toLowerCase() === 'supervisor' && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditar(item)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" title="Editar Artigo">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExcluir(item.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Excluir Artigo">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${estilo.cor}`}>
                    {estilo.icone} {item.categoria}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-black mb-3 pr-16 leading-tight">{item.titulo}</h2>
                
                {item.imagem && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-zinc-200">
                    <img src={`http://localhost:3333/uploads/${item.imagem}`} alt={item.titulo} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                
                <div className="bg-zinc-50 p-4 rounded-lg flex-grow border border-zinc-100">
                  <p className="text-zinc-700 text-sm whitespace-pre-wrap font-medium">{item.conteudo}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-200 border-dashed">
            <Search className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
            <p className="text-lg font-medium">Nenhum resultado encontrado na aba "{abaAtiva}"</p>
          </div>
        )}
      </div>

    </div>
  );
}