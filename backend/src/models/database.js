const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'portal_cac.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao abrir banco:", err.message);
    } else {
        console.log("Banco de dados SQLite conectado.");
        
        db.serialize(() => {
            // Cria a tabela caso não exista
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                matricula TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                cargo TEXT NOT NULL,
                foto_perfil TEXT
            )`);

            // Este comando previne erros. Se a coluna já existir, ele só ignora silenciosamente.
            db.run(`ALTER TABLE users ADD COLUMN foto_perfil TEXT`, (err) => {});

            db.run(`CREATE TABLE IF NOT EXISTS wiki (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria TEXT NOT NULL,
                titulo TEXT NOT NULL,
                conteudo TEXT NOT NULL,
                imagem TEXT
            )`);
        });

        db.run(`CREATE TABLE IF NOT EXISTS escalas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_nome TEXT NOT NULL,
                data TEXT NOT NULL,
                entrada TEXT NOT NULL,
                pre_pausa_1 TEXT,
                almoco_inicio TEXT,
                almoco_fim TEXT,
                pre_pausa_2 TEXT,
                saida TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS trocas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                solicitante TEXT NOT NULL,
                alvo TEXT NOT NULL,
                data TEXT NOT NULL,
                status TEXT DEFAULT 'pendente'
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS incidentes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descricao TEXT NOT NULL,
                regiao TEXT NOT NULL,
                data_hora TEXT NOT NULL,
                status TEXT DEFAULT 'ativo',
                autor TEXT NOT NULL
            )`);

            // Tabela do Diário de Bordo
            db.run(`CREATE TABLE IF NOT EXISTS diario_bordo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mensagem TEXT NOT NULL,
                pessoas_afetadas INTEGER,
                is_oscilacao BOOLEAN,
                horario_inicio TEXT,
                horario_normalizacao TEXT,
                data_registro TEXT NOT NULL,
                autor TEXT NOT NULL
            )`);
    }
});

module.exports = db;