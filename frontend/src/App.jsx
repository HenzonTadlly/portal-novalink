import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importação das Telas
import Login from './pages/Login';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Calculadora from './pages/Calculadora';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import Escalas from './pages/Escalas';
import Notificacoes from './pages/Notificacoes'; 
import Incidentes from './pages/Incidentes';
import DiarioBordo from './pages/DiarioBordo'; // <--- IMPORTAÇÃO AQUI!

// Importação do Menu
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/usuarios" element={<GerenciarUsuarios />} />
          <Route path="/escalas" element={<Escalas />} />
          <Route path="/notificacoes" element={<Notificacoes />} /> 
          <Route path="/incidentes" element={<Incidentes />} /> 
          <Route path="/diario" element={<DiarioBordo />} /> {/* <--- ROTA AQUI! */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;