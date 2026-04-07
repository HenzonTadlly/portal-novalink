const db = require('../models/database');
const fs = require('fs'); // Para podermos apagar o arquivo de imagem
const path = require('path');

const adicionarArtigo = (req, res) => {
    const { categoria, titulo, conteudo } = req.body;
    const imagem = req.file ? req.file.filename : null; 

    if (!categoria || !titulo || !conteudo) {
        return res.status(400).json({ erro: "Preencha categoria, titulo e conteudo." });
    }

    const sql = `INSERT INTO wiki (categoria, titulo, conteudo, imagem) VALUES (?, ?, ?, ?)`;
    db.run(sql, [categoria, titulo, conteudo, imagem], function (err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Artigo adicionado com sucesso!", id: this.lastID });
    });
};

const listarArtigos = (req, res) => {
    const sql = `SELECT * FROM wiki ORDER BY id DESC`; 
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

// NOVA FUNÇÃO: Editar Artigo
const editarArtigo = (req, res) => {
    const { id } = req.params;
    const { categoria, titulo, conteudo } = req.body;
    const novaImagem = req.file ? req.file.filename : null;

    // Se o usuário mandou uma imagem nova, atualiza tudo. Se não mandou, atualiza só os textos.
    if (novaImagem) {
        const sql = `UPDATE wiki SET categoria = ?, titulo = ?, conteudo = ?, imagem = ? WHERE id = ?`;
        db.run(sql, [categoria, titulo, conteudo, novaImagem, id], function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Artigo atualizado com sucesso!" });
        });
    } else {
        const sql = `UPDATE wiki SET categoria = ?, titulo = ?, conteudo = ? WHERE id = ?`;
        db.run(sql, [categoria, titulo, conteudo, id], function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Artigo atualizado com sucesso!" });
        });
    }
};

// NOVA FUNÇÃO: Excluir Artigo
const excluirArtigo = (req, res) => {
    const { id } = req.params;

    // Primeiro, vamos procurar o artigo para ver se ele tem imagem e apagar o arquivo da pasta
    db.get(`SELECT imagem FROM wiki WHERE id = ?`, [id], (err, row) => {
        if (row && row.imagem) {
            const imagePath = path.join(__dirname, '../../public/uploads', row.imagem);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Deleta o arquivo físico
            }
        }

        // Agora deleta do banco de dados
        db.run(`DELETE FROM wiki WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Artigo excluído com sucesso!" });
        });
    });
};

module.exports = { adicionarArtigo, listarArtigos, editarArtigo, excluirArtigo };