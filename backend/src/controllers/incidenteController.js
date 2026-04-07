const db = require('../models/database');

const criarIncidente = (req, res) => {
    const { titulo, descricao, regiao, autor } = req.body;
    
    // Pega a data e hora exata de agora
    const dataObj = new Date();
    const data_hora = `${dataObj.toLocaleDateString('pt-BR')} às ${dataObj.toLocaleTimeString('pt-BR')}`;

    db.run(`INSERT INTO incidentes (titulo, descricao, regiao, data_hora, status, autor) VALUES (?, ?, ?, ?, 'ativo', ?)`, 
    [titulo, descricao, regiao, data_hora, autor], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Alerta de Incidente lançado com sucesso!" });
    });
};

const listarTodos = (req, res) => {
    db.all(`SELECT * FROM incidentes ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

const listarAtivos = (req, res) => {
    db.all(`SELECT * FROM incidentes WHERE status = 'ativo' ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

const resolverIncidente = (req, res) => {
    db.run(`UPDATE incidentes SET status = 'resolvido' WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Incidente marcado como resolvido!" });
    });
};

module.exports = { criarIncidente, listarTodos, listarAtivos, resolverIncidente };