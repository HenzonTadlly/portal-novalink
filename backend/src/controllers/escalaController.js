const db = require('../models/database');

const salvarEscala = (req, res) => {
    const { usuario_nome, data, entrada, pre_pausa_1, almoco_inicio, almoco_fim, pre_pausa_2, saida } = req.body;
    db.run(`INSERT INTO escalas (usuario_nome, data, entrada, pre_pausa_1, almoco_inicio, almoco_fim, pre_pausa_2, saida) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [usuario_nome, data, entrada, pre_pausa_1, almoco_inicio, almoco_fim, pre_pausa_2, saida], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Escala salva!" });
    });
};

const listarEscalas = (req, res) => {
    db.all(`SELECT * FROM escalas ORDER BY data DESC, entrada ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

const excluirEscala = (req, res) => {
    db.run(`DELETE FROM escalas WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Escala removida!" });
    });
};

const solicitarTroca = (req, res) => {
    const { solicitante, alvo, data } = req.body;
    db.run(`INSERT INTO trocas (solicitante, alvo, data) VALUES (?, ?, ?)`, [solicitante, alvo, data], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Solicitação enviada para a supervisão!" });
    });
};

const listarTrocas = (req, res) => {
    db.all(`SELECT * FROM trocas ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
};

// AQUI ESTÁ A MÁGICA: O SISTEMA TROCA OS HORÁRIOS SOZINHO!
const responderTroca = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'aprovada' ou 'rejeitada'

    db.get(`SELECT * FROM trocas WHERE id = ?`, [id], (err, troca) => {
        if (err || !troca) return res.status(500).json({ erro: "Troca não encontrada." });

        db.run(`UPDATE trocas SET status = ? WHERE id = ?`, [status, id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            
            // Se o supervisor aprovou, vamos inverter os donos da escala naquele dia específico!
            if (status === 'aprovada') {
                db.all(`SELECT * FROM escalas WHERE data = ? AND (usuario_nome = ? OR usuario_nome = ?)`, 
                       [troca.data, troca.solicitante, troca.alvo], (err, rows) => {
                    if (!err && rows.length > 0) {
                        rows.forEach(row => {
                            const novoDono = row.usuario_nome === troca.solicitante ? troca.alvo : troca.solicitante;
                            db.run(`UPDATE escalas SET usuario_nome = ? WHERE id = ?`, [novoDono, row.id]);
                        });
                    }
                });
            }
            res.json({ mensagem: `Troca ${status}!` });
        });
    });
};

module.exports = { salvarEscala, listarEscalas, excluirEscala, solicitarTroca, listarTrocas, responderTroca };