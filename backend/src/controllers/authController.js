const db = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'chave_super_secreta_NovaLink';

const registrar = async (req, res) => {
    const { nome, matricula, senha, cargo } = req.body;
    const cargoDefinido = cargo || 'atendente';

    if (!nome || !matricula || !senha) return res.status(400).json({ erro: "Preencha nome, matricula e senha." });

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const sql = `INSERT INTO users (nome, matricula, senha, cargo) VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [nome, matricula, senhaHash, cargoDefinido], function(err) {
            if (err) return res.status(400).json({ erro: "Matrícula já cadastrada." });
            res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno." });
    }
};

const login = (req, res) => {
    const { matricula, senha } = req.body;
    if (!matricula || !senha) return res.status(400).json({ erro: "Informe matrícula e senha." });

    db.get(`SELECT * FROM users WHERE matricula = ?`, [matricula], async (err, user) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!user) return res.status(404).json({ erro: "Usuário não encontrado." });

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return res.status(401).json({ erro: "Senha incorreta." });

        const token = jwt.sign({ id: user.id, nome: user.nome }, SECRET_KEY, { expiresIn: '8h' });
        // Agora retornamos a foto_perfil também!
        res.json({ mensagem: "Sucesso!", token, nome: user.nome, cargo: user.cargo, foto_perfil: user.foto_perfil });
    });
};

const listarUsuarios = (req, res) => {
    db.all(`SELECT id, nome, matricula, cargo, foto_perfil FROM users ORDER BY nome ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

const editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, matricula, cargo, senha } = req.body;

    try {
        if (senha) {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);
            db.run(`UPDATE users SET nome = ?, matricula = ?, cargo = ?, senha = ? WHERE id = ?`, 
                [nome, matricula, cargo, senhaHash, id], function(err) {
                if (err) return res.status(400).json({ erro: "Erro ao atualizar." });
                res.json({ mensagem: "Usuário atualizado!" });
            });
        } else {
            db.run(`UPDATE users SET nome = ?, matricula = ?, cargo = ? WHERE id = ?`, 
                [nome, matricula, cargo, id], function(err) {
                if (err) return res.status(400).json({ erro: "Erro ao atualizar." });
                res.json({ mensagem: "Usuário atualizado!" });
            });
        }
    } catch (error) { res.status(500).json({ erro: "Erro interno." }); }
};

const excluirUsuario = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Usuário excluído!" });
    });
};

// NOVA FUNÇÃO PARA RECEBER A FOTO
const atualizarFotoPorNome = (req, res) => {
    const { nome } = req.body;
    const foto_perfil = req.file ? req.file.filename : null;

    if (!nome || !foto_perfil) return res.status(400).json({ erro: "Faltando usuário ou arquivo." });

    db.run(`UPDATE users SET foto_perfil = ? WHERE nome = ?`, [foto_perfil, nome], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Foto atualizada com sucesso!", foto_perfil });
    });
};

module.exports = { registrar, login, listarUsuarios, editarUsuario, excluirUsuario, atualizarFotoPorNome };