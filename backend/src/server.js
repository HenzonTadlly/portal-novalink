const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { salvarEscala, listarEscalas, excluirEscala, solicitarTroca, listarTrocas, responderTroca } = require('./controllers/escalaController');// Conexão com o Banco de Dados
require('./models/database');
const { criarIncidente, listarTodos, listarAtivos, resolverIncidente } = require('./controllers/incidenteController');
// Importações dos Controllers (AQUI ESTAVA O ERRO, AGORA ESTÁ COMPLETO!)
const { calcularProrata, calcularMulta, calcularMudancaVencimento } = require('./controllers/calculatorController');
const { adicionarArtigo, listarArtigos, editarArtigo, excluirArtigo } = require('./controllers/wikiController');
const { registrar, login, listarUsuarios, editarUsuario, excluirUsuario, atualizarFotoPorNome } = require('./controllers/authController');
const { registrarDiario, listarDiario, excluirDiario } = require('./controllers/diarioController');
const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DE UPLOAD DE IMAGENS (MULTER) ---
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Permite o Front-end acessar a pasta de imagens
app.use('/uploads', express.static(uploadDir));

// --- ROTAS DE AUTENTICAÇÃO E GESTÃO DE USUÁRIOS ---
app.post('/api/auth/registrar', registrar);
app.post('/api/auth/login', login);
app.get('/api/auth/usuarios', listarUsuarios);
app.put('/api/auth/usuarios/:id', editarUsuario);
app.delete('/api/auth/usuarios/:id', excluirUsuario);
app.post('/api/auth/foto', upload.single('foto'), atualizarFotoPorNome);
// --- ROTAS DA CALCULADORA ---
app.post('/api/calculadora/prorata', calcularProrata);
app.post('/api/calculadora/multa', calcularMulta);
app.post('/api/calculadora/mudancavencimento', calcularMudancaVencimento);
// --- ROTAS DA WIKI ---
app.post('/api/wiki', upload.single('imagem'), adicionarArtigo);
app.get('/api/wiki', listarArtigos);
app.put('/api/wiki/:id', upload.single('imagem'), editarArtigo);
app.delete('/api/wiki/:id', excluirArtigo);

// --- ROTAS DE ESCALAS ---
app.post('/api/escalas', salvarEscala);
app.get('/api/escalas', listarEscalas);
app.delete('/api/escalas/:id', excluirEscala);
app.post('/api/escalas/trocas', solicitarTroca);
app.get('/api/escalas/trocas', listarTrocas);
app.put('/api/escalas/trocas/:id', responderTroca);

// --- ROTAS DE INCIDENTES ---
app.post('/api/incidentes', criarIncidente);
app.get('/api/incidentes', listarTodos);
app.get('/api/incidentes/ativos', listarAtivos);
app.put('/api/incidentes/:id/resolver', resolverIncidente);

// --- ROTAS DO DIÁRIO DE BORDO ---
app.post('/api/diario', registrarDiario);
app.get('/api/diario', listarDiario);
app.delete('/api/diario/:id', excluirDiario);

// --- INICIANDO O SERVIDOR ---
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);

    
});