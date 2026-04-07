const db = require('../models/database');

const registrarDiario = (req, res) => {
    const { mensagem, pessoas_afetadas, is_oscilacao, horario_inicio, horario_normalizacao, data_registro, autor } = req.body;
    
    db.run(`INSERT INTO diario_bordo (mensagem, pessoas_afetadas, is_oscilacao, horario_inicio, horario_normalizacao, data_registro, autor) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [mensagem, pessoas_afetadas, is_oscilacao, horario_inicio, horario_normalizacao, data_registro, autor], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Registro adicionado ao Diário de Bordo!" });
    });
};

const listarDiario = (req, res) => {
    db.all(`SELECT * FROM diario_bordo ORDER BY data_registro DESC, id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

const excluirDiario = (req, res) => {
    db.run(`DELETE FROM diario_bordo WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Registro removido!" });
    });
};

module.exports = { registrarDiario, listarDiario, excluirDiario };