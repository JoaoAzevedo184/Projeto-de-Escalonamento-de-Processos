/**
 * Implementação do algoritmo de escalonamento Round Robin (RR)
 * 
 * O Round Robin é um algoritmo de escalonamento preemptivo que atribui a cada processo
 * um intervalo de tempo fixo, chamado quantum. Após esse tempo, se o processo ainda não
 * tiver terminado, ele é colocado no final da fila de prontos e o próximo processo é executado.
 */

/**
 * Executa o algoritmo de escalonamento Round Robin
 * @param {Array} processos - Array de objetos de processo: {id, chegada, duracao}
 * @param {Number} quantum - Valor do quantum de tempo
 * @return {Object} Resultado da execução com timeline e métricas
 */
function roundRobin(processos, quantum) {
    // Clonar os processos para não modificar o array original
    const processosCopia = processos.map(p => ({
        ...p,
        tempoRestante: p.duracao,        // Tempo de execução restante
        inicioExecucao: null,            // Quando o processo foi executado pela primeira vez
        ultimaExecucao: null,            // Última vez que o processo foi executado
        concluido: false,                // Se o processo foi concluído
        tempoEspera: 0,                  // Tempo total de espera
        tempoRetorno: 0,                 // Tempo de retorno (turnaround)
        tempoResposta: -1                // Tempo de resposta (primeira execução)
    }));

    // Ordenar por tempo de chegada
    processosCopia.sort((a, b) => a.chegada - b.chegada);

    // Resultado da execução
    const resultado = {
        algoritmo: 'RR',
        quantum: quantum,
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
    let fila = [];
    let processosRestantes = processosCopia.length;
    let idleTime = 0;

    // Continuar até que todos os processos sejam concluídos
    while (processosRestantes > 0) {
        // Verificar novos processos que chegaram neste momento
        for (let i = 0; i < processosCopia.length; i++) {
            const processo = processosCopia[i];
            if (processo.chegada <= tempoAtual && !processo.concluido && !fila.includes(processo)) {
                // Verifica se o processo não está já na fila e não foi concluído
                if (!fila.some(p => p.id === processo.id)) {
                    fila.push(processo);
                }
            }
        }

        // Se não há processos na fila, avança o tempo até o próximo processo chegar
        if (fila.length === 0) {
            // Encontrar o próximo processo a chegar
            const proximoProcesso = processosCopia
                .filter(p => !p.concluido && p.chegada > tempoAtual)
                .sort((a, b) => a.chegada - b.chegada)[0];

            if (proximoProcesso) {
                // Adicionar período ocioso ao resultado
                if (proximoProcesso.chegada > tempoAtual) {
                    resultado.execucao.push({
                        tipo: 'idle',
                        inicio: tempoAtual,
                        fim: proximoProcesso.chegada
                    });
                    idleTime += (proximoProcesso.chegada - tempoAtual);
                }
                
                tempoAtual = proximoProcesso.chegada;
            } else {
                // Não há mais processos para chegar, algo deu errado
                console.error('Erro no algoritmo: sem processos na fila e nenhum processo para chegar');
                break;
            }
            continue;
        }

        // Pegar o próximo processo da fila
        const processoAtual = fila.shift();

        // Registrar o tempo de resposta (primeira vez que o processo é executado)
        if (processoAtual.tempoResposta === -1) {
            processoAtual.tempoResposta = tempoAtual - processoAtual.chegada;
        }

        // Calcular o tempo que este processo vai executar neste momento
        const tempoExecucao = Math.min(quantum, processoAtual.tempoRestante);

        // Registrar o tempo de início de execução se for a primeira execução
        if (processoAtual.inicioExecucao === null) {
            processoAtual.inicioExecucao = tempoAtual;
        }

        // Atualizar a última vez que o processo foi executado
        processoAtual.ultimaExecucao = tempoAtual;

        // Adicionar esta execução ao resultado
        resultado.execucao.push({
            tipo: 'processo',
            processo: processoAtual.id,
            inicio: tempoAtual,
            fim: tempoAtual + tempoExecucao
        });

        // Atualizar o tempo restante do processo
        processoAtual.tempoRestante -= tempoExecucao;
        tempoAtual += tempoExecucao;

        // Verificar novamente processos que chegaram durante esta execução
        for (let i = 0; i < processosCopia.length; i++) {
            const processo = processosCopia[i];
            if (processo.chegada <= tempoAtual && !processo.concluido && processo.id !== processoAtual.id) {
                // Verifica se o processo não está já na fila
                if (!fila.some(p => p.id === processo.id)) {
                    fila.push(processo);
                }
            }
        }

        // Verificar se o processo terminou
        if (processoAtual.tempoRestante <= 0) {
            // Processo concluído
            processoAtual.concluido = true;
            processosRestantes--;

            // Calcular métricas para este processo
            processoAtual.tempoRetorno = tempoAtual - processoAtual.chegada;
            processoAtual.tempoEspera = processoAtual.tempoRetorno - processoAtual.duracao;

            // Adicionar métricas deste processo ao resultado
            resultado.metricas.processos.push({
                id: processoAtual.id,
                tempoEspera: processoAtual.tempoEspera,
                tempoRetorno: processoAtual.tempoRetorno,
                tempoResposta: processoAtual.tempoResposta
            });
        } else {
            // Se o processo não terminou, colocar de volta no final da fila
            fila.push(processoAtual);
        }
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
 * @param {Number} quantum - Valor do quantum
 * @return {Object} Objeto com status e mensagem de erro, se houver
 */
function validarParametrosRR(processos, quantum) {
    if (!Array.isArray(processos) || processos.length === 0) {
        return { valido: false, mensagem: 'Lista de processos vazia ou inválida' };
    }

    if (!quantum || quantum <= 0) {
        return { valido: false, mensagem: 'Quantum deve ser um número positivo' };
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
 * Função principal que executa o algoritmo Round Robin com validação
 * @param {Array} processos - Array de objetos de processo
 * @param {Number} quantum - Valor do quantum
 * @return {Object} Resultado da execução ou objeto de erro
 */
function executarRR(processos, quantum) {
    // Validar parâmetros
    const validacao = validarParametrosRR(processos, quantum);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return roundRobin(processos, quantum);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo Round Robin: ' + error.message 
        };
    }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarRR,
        roundRobin,
        validarParametrosRR
    };
}