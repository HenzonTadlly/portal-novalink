const calcularProrata = (req, res) => {
    const { valorMensal, diasUso } = req.body;
    if (!valorMensal || diasUso === undefined) return res.status(400).json({ erro: "Preencha o valor." });
    
    const valorProporcional = (valorMensal / 30) * diasUso;
    res.json({ valorProporcional });
};

const calcularMulta = (req, res) => {
    const { valorContrato, mesesRestantes } = req.body;
    if (!valorContrato || mesesRestantes === undefined) return res.status(400).json({ erro: "Preencha o valor." });
    
    const valorMulta = (valorContrato / 12) * mesesRestantes;
    res.json({ valorMulta });
};

// --- NOVA FUNÇÃO: Mudança de Vencimento Inteligente ---
const calcularMudancaVencimento = (req, res) => {
    const { valorFatura, vencimentoAtual, novoVencimento } = req.body;
    
    if (!valorFatura || !vencimentoAtual || !novoVencimento) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    // Calcula a diferença de dias (Ex: de 10 para 5 = -5 dias)
    const diferencaDias = novoVencimento - vencimentoAtual;
    const valorDiaria = valorFatura / 30;
    
    // O Math.abs tira o sinal de negativo para podermos usar no texto
    const valorProporcional = Math.abs(diferencaDias) * valorDiaria;
    
    let valorTotal = valorFatura;
    let tipo = 'nenhum';

    if (diferencaDias > 0) {
        tipo = 'acrescimo'; // Atrasou o vencimento = Paga mais
        valorTotal = valorFatura + valorProporcional;
    } else if (diferencaDias < 0) {
        tipo = 'desconto'; // Adiantou o vencimento = Paga menos
        valorTotal = valorFatura - valorProporcional;
    }

    res.json({ 
        valorDiaria, 
        valorProporcional, 
        valorTotal, 
        tipo, 
        diferencaDias: Math.abs(diferencaDias) 
    });
};

module.exports = { calcularProrata, calcularMulta, calcularMudancaVencimento };