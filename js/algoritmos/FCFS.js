
/**
 * Implementação do algoritmo de escalonamento First Come First Serve (FCFS)
 * 
 * O FCFS é o algoritmo mais simples de escalonamento, onde os processos são executados
 * na ordem em que chegam, sem interrupção. O primeiro processo a chegar é o primeiro a
 * ser executado completamente, e assim por diante.
 */

/**
 * Executa o algoritmo de escalonamento First Come First Serve
 * @param {Array} processos - Array de objetos de processo: {id, chegada, duracao}
 * @return {Object} Resultado da execução com timeline e métricas
 */
function firstComeFirstServe(processos) {
    // Clonar os processos para não modificar o array original
    const processosCopia = processos.map(p => ({
        ...p,
        inicioExecucao: null,        // Quando o processo começou a executar
        fimExecucao: null,           // Quando o processo terminou de executar
        tempoEspera: 0,              // Tempo total de espera
        tempoRetorno: 0,             // Tempo de retorno (turnaround)
        tempoResposta: 0             // Tempo de resposta (primeira execução)
    }));

    // Ordenar por tempo de chegada
    processosCopia.sort((a, b) => a.chegada - b.chegada);

    // Resultado da execução
    const resultado = {
        algoritmo: 'FCFS',
        tempoTotal: 0,
        execucao: [],
        metricas: {
            processos: [],
            tempoMedioEspera: 0,
            tempoMedioRetorno: 0,
            tempoMedioResposta: 0
        }
    };

    // Variáveis de controle
    let tempoAtual = 0;
    let idleTime = 0;

    // Para cada processo na ordem de chegada
    for (let i = 0; i < processosCopia.length; i++) {
        const processo = processosCopia[i];
        
        // Se o tempo atual é menor que o tempo de chegada, avança o tempo
        // e registra período ocioso
        if (tempoAtual < processo.chegada) {
            resultado.execucao.push({
                tipo: 'idle',
                inicio: tempoAtual,
                fim: processo.chegada
            });
            
            idleTime += (processo.chegada - tempoAtual);
            tempoAtual = processo.chegada;
        }
        
        // Registrar início da execução
        processo.inicioExecucao = tempoAtual;
        
        // Calcular tempo de espera e tempo de resposta
        processo.tempoEspera = tempoAtual - processo.chegada;
        processo.tempoResposta = processo.tempoEspera; // No FCFS, tempo de espera e resposta são iguais
        
        // Registrar execução do processo
        resultado.execucao.push({
            tipo: 'processo',
            processo: processo.id,
            inicio: tempoAtual,
            fim: tempoAtual + processo.duracao
        });
        
        // Avançar o tempo
        tempoAtual += processo.duracao;
        
        // Registrar fim da execução
        processo.fimExecucao = tempoAtual;
        
        // Calcular tempo de retorno (turnaround)
        processo.tempoRetorno = processo.fimExecucao - processo.chegada;
        
        // Adicionar métricas do processo ao resultado
        resultado.metricas.processos.push({
            id: processo.id,
            tempoEspera: processo.tempoEspera,
            tempoRetorno: processo.tempoRetorno,
            tempoResposta: processo.tempoResposta
        });
    }

    // Atualizar o tempo total da simulação
    resultado.tempoTotal = tempoAtual;

    // Calcular métricas médias
    if (resultado.metricas.processos.length > 0) {
        resultado.metricas.tempoMedioEspera = resultado.metricas.processos.reduce((sum, p) => sum + p.tempoEspera, 0) / resultado.metricas.processos.length;
        resultado.metricas.tempoMedioRetorno = resultado.metricas.processos.reduce((sum, p) => sum + p.tempoRetorno, 0) / resultado.metricas.processos.length;
        resultado.metricas.tempoMedioResposta = resultado.metricas.processos.reduce((sum, p) => sum + p.tempoResposta, 0) / resultado.metricas.processos.length;
    }

    // Calcular utilização da CPU
    resultado.metricas.utilizacaoCPU = ((tempoAtual - idleTime) / tempoAtual) * 100;

    // Calcular throughput
    resultado.metricas.throughput = processosCopia.length / tempoAtual;

    return resultado;
}

/**
 * Valida os parâmetros de entrada do algoritmo
 * @param {Array} processos - Array de objetos de processo
 * @return {Object} Objeto com status e mensagem de erro, se houver
 */
function validarParametrosFCFS(processos) {
    if (!Array.isArray(processos) || processos.length === 0) {
        return { valido: false, mensagem: 'Lista de processos vazia ou inválida' };
    }

    // Verificar se cada processo tem os campos necessários
    for (let i = 0; i < processos.length; i++) {
        const p = processos[i];
        if (!p.id || typeof p.chegada !== 'number' || typeof p.duracao !== 'number') {
            return { 
                valido: false, 
                mensagem: `Processo ${i+1} tem campos inválidos. Cada processo deve ter id, chegada e duracao.` 
            };
        }

        if (p.duracao <= 0) {
            return { 
                valido: false, 
                mensagem: `Processo ${p.id} tem duração inválida. A duração deve ser maior que zero.` 
            };
        }

        if (p.chegada < 0) {
            return { 
                valido: false, 
                mensagem: `Processo ${p.id} tem tempo de chegada inválido. O tempo de chegada não pode ser negativo.` 
            };
        }
    }

    return { valido: true };
}

/**
 * Função principal que executa o algoritmo FCFS com validação
 * @param {Array} processos - Array de objetos de processo
 * @return {Object} Resultado da execução ou objeto de erro
 */
function executarFCFS(processos) {
    // Validar parâmetros
    const validacao = validarParametrosFCFS(processos);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return firstComeFirstServe(processos);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo FCFS: ' + error.message 
        };
    }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarFCFS,
        firstComeFirstServe,
        validarParametrosFCFS
    };
}