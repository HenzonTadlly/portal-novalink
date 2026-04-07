import React, { useState } from 'react';
import { Calculator, DollarSign, Calendar, CalendarClock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function Calculadora() {
  const [valorMensal, setValorMensal] = useState('');
  const [diasUso, setDiasUso] = useState('');
  const [resultadoProrata, setResultadoProrata] = useState(null);

  const [valorContrato, setValorContrato] = useState('');
  const [mesesRestantes, setMesesRestantes] = useState('');
  const [resultadoMulta, setResultadoMulta] = useState(null);

  const [valorFaturaMudanca, setValorFaturaMudanca] = useState('');
  const [vencimentoAtual, setVencimentoAtual] = useState('');
  const [novoVencimento, setNovoVencimento] = useState('');
  const [resultadoMudanca, setResultadoMudanca] = useState(null);

  const calcularProrata = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/calculadora/prorata', { valorMensal: Number(valorMensal), diasUso: Number(diasUso) });
      setResultadoProrata(res.data.valorProporcional);
    } catch (error) { alert("Erro ao calcular Pro-rata."); }
  };

  const calcularMulta = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/calculadora/multa', { valorContrato: Number(valorContrato), mesesRestantes: Number(mesesRestantes) });
      setResultadoMulta(res.data.valorMulta);
    } catch (error) { alert("Erro ao calcular Multa."); }
  };

  const calcularMudancaVencimento = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/calculadora/mudancavencimento', { 
        valorFatura: Number(valorFaturaMudanca), 
        vencimentoAtual: Number(vencimentoAtual),
        novoVencimento: Number(novoVencimento)
      });
      setResultadoMudanca(res.data);
    } catch (error) { alert("Erro ao calcular mudança de vencimento."); }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-zinc-900 flex items-center gap-4 tracking-tight">
          <div className="bg-red-100 p-3 rounded-2xl">
            <Calculator className="w-8 h-8 text-red-600" />
          </div>
          Calculadoras Auxiliares
        </h1>
        <p className="text-zinc-500 mt-3 text-lg font-medium ml-1">Agilize o atendimento com cálculos precisos e automáticos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARD 1: PRO-RATA */}
        <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 border-black">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-zinc-100 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800">Pro-rata Avulso</h2>
          </div>
          
          <form onSubmit={calcularProrata} className="flex flex-col gap-5 flex-grow">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Mensal (R$)</label>
              <input type="number" required placeholder="0.00" step="0.01" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-medium" value={valorMensal} onChange={e => setValorMensal(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dias de Uso</label>
              <input type="number" required placeholder="Ex: 15" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-medium" value={diasUso} onChange={e => setDiasUso(e.target.value)} />
            </div>
            <button type="submit" className="mt-auto bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all shadow-md">Calcular Pro-rata</button>
          </form>
          
          {resultadoProrata !== null && (
            <div className="mt-8 bg-zinc-50 border border-zinc-200 p-5 rounded-2xl text-center animate-fade-in-down">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Valor Proporcional</p>
              <p className="text-4xl font-black text-black flex justify-center items-center gap-1">
                <DollarSign className="w-7 h-7 text-zinc-400" /> {resultadoProrata.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* CARD 2: MUDANÇA DE VENCIMENTO */}
        <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 border-red-600 relative overflow-hidden">
          {/* Efeito visual de luz no fundo do card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="bg-red-100 p-3 rounded-xl">
              <CalendarClock className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800">Alterar Vencimento</h2>
          </div>
          
          <form onSubmit={calcularMudancaVencimento} className="flex flex-col gap-5 flex-grow relative z-10">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor da Fatura Atual (R$)</label>
              <input type="number" required placeholder="0.00" step="0.01" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium" value={valorFaturaMudanca} onChange={e => setValorFaturaMudanca(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dia Atual</label>
                <input type="number" min="1" max="31" required placeholder="Ex: 10" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium" value={vencimentoAtual} onChange={e => setVencimentoAtual(e.target.value)} />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Novo Dia</label>
                <input type="number" min="1" max="31" required placeholder="Ex: 5" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium" value={novoVencimento} onChange={e => setNovoVencimento(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="mt-auto bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 active:scale-95 transition-all shadow-[0_4px_14px_rgba(220,38,38,0.4)]">Simular Nova Fatura</button>
          </form>

          {resultadoMudanca && (
            <div className={`mt-8 p-5 rounded-2xl text-center animate-fade-in-down border relative z-10 ${
              resultadoMudanca.tipo === 'desconto' ? 'bg-green-50/80 border-green-200' : 
              resultadoMudanca.tipo === 'acrescimo' ? 'bg-red-50/80 border-red-200' : 
              'bg-zinc-50 border-zinc-200'
            }`}>
              {resultadoMudanca.tipo === 'desconto' && (
                <p className="text-xs text-green-700 font-extrabold mb-3 flex items-center justify-center gap-1 bg-green-100 py-1.5 rounded-lg w-fit mx-auto px-3">
                  <ArrowDownRight className="w-4 h-4" /> DESCONTO DE {resultadoMudanca.diferencaDias} DIAS
                </p>
              )}
              {resultadoMudanca.tipo === 'acrescimo' && (
                <p className="text-xs text-red-700 font-extrabold mb-3 flex items-center justify-center gap-1 bg-red-100 py-1.5 rounded-lg w-fit mx-auto px-3">
                  <ArrowUpRight className="w-4 h-4" /> ACRÉSCIMO DE {resultadoMudanca.diferencaDias} DIAS
                </p>
              )}
              
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                resultadoMudanca.tipo === 'desconto' ? 'text-green-800' : 
                resultadoMudanca.tipo === 'acrescimo' ? 'text-red-800' : 'text-zinc-500'
              }`}>
                Total Próxima Fatura
              </p>
              <p className={`text-4xl font-black flex justify-center items-center gap-1 ${
                resultadoMudanca.tipo === 'desconto' ? 'text-green-600' : 
                resultadoMudanca.tipo === 'acrescimo' ? 'text-red-600' : 'text-black'
              }`}>
                <DollarSign className="w-7 h-7 opacity-70" /> {resultadoMudanca.valorTotal.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* CARD 3: MULTA */}
        <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-zinc-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 border-zinc-400">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-zinc-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800">Multa por Quebra</h2>
          </div>
          
          <form onSubmit={calcularMulta} className="flex flex-col gap-5 flex-grow">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total do Contrato (R$)</label>
              <input type="number" required placeholder="0.00" step="0.01" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 outline-none transition-all font-medium" value={valorContrato} onChange={e => setValorContrato(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Meses Restantes</label>
              <input type="number" required placeholder="Ex: 5" className="w-full mt-1.5 p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 outline-none transition-all font-medium" value={mesesRestantes} onChange={e => setMesesRestantes(e.target.value)} />
            </div>
            <button type="submit" className="mt-auto bg-zinc-700 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all shadow-md">Calcular Multa</button>
          </form>

          {resultadoMulta !== null && (
            <div className="mt-8 bg-zinc-50 border border-zinc-200 p-5 rounded-2xl text-center animate-fade-in-down">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Valor da Multa</p>
              <p className="text-4xl font-black text-zinc-800 flex justify-center items-center gap-1">
                <DollarSign className="w-7 h-7 text-zinc-400" /> {resultadoMulta.toFixed(2)}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}