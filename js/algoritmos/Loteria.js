/**
 * Implementação do algoritmo de escalonamento por Loteria
 * 
 * O algoritmo de Loteria é um método de escalonamento probabilístico onde cada processo
 * recebe um número de bilhetes e o escalonador seleciona aleatoriamente um bilhete para
 * determinar qual processo será executado. Processos com mais bilhetes têm maior probabilidade
 * de serem selecionados.
 */

/**
 * Executa o algoritmo de escalonamento por Loteria
 * @param {Array} processos - Array de objetos de processo: {id, chegada, duracao, bilhetes}
 * @param {Number} quantum - Valor do quantum de tempo (opcional, padrão: 1)
 * @return {Object} Resultado da execução com timeline e métricas
 */
function escalonamentoLoteria(processos, quantum = 1) {
    // Clonar os processos para não modificar o array original
    const processosCopia = processos.map(p => ({
        ...p,
        tempoRestante: p.duracao,        // Tempo de execução restante
        inicioExecucao: null,            // Quando o processo foi executado pela primeira vez
        ultimaExecucao: null,            // Última vez que o processo foi executado
        concluido: false,                // Se o processo foi concluído
        tempoEspera: 0,                  // Tempo total de espera
        tempoRetorno: 0,                 // Tempo de retorno (turnaround)
        tempoResposta: -1,               // Tempo de resposta (primeira execução)
        bilhetes: p.bilhetes || 1        // Número de bilhetes (padrão: 1)
    }));

    // Ordenar por tempo de chegada
    processosCopia.sort((a, b) => a.chegada - b.chegada);

    // Resultado da execução
    const resultado = {
        algoritmo: 'LOTERIA',
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
    let processosRestantes = processosCopia.length;
    let idleTime = 0;
    let processoAtualId = null;

    // Continuar até que todos os processos sejam concluídos
    while (processosRestantes > 0) {
        // Verificar quais processos estão disponíveis neste momento
        const processosDisponiveis = processosCopia.filter(p => 
            !p.concluido && p.chegada <= tempoAtual
        );

        // Se não há processos disponíveis, avançar o tempo
        if (processosDisponiveis.length === 0) {
            // Encontrar o próximo processo a chegar
            const proximoProcesso = processosCopia
                .filter(p => !p.concluido && p.chegada > tempoAtual)
                .sort((a, b) => a.chegada - b.chegada)[0];

            if (proximoProcesso) {
                // Adicionar período ocioso ao resultado
                resultado.execucao.push({
                    tipo: 'idle',
                    inicio: tempoAtual,
                    fim: proximoProcesso.chegada
                });
                
                idleTime += (proximoProcesso.chegada - tempoAtual);
                tempoAtual = proximoProcesso.chegada;
            } else {
                // Não há mais processos para chegar, algo deu errado
                console.error('Erro no algoritmo: sem processos disponíveis e nenhum processo para chegar');
                break;
            }
            continue;
        }

        // Distribuir bilhetes para os processos disponíveis
        let totalBilhetes = 0;
        const bilhetesDistribuidos = [];

        processosDisponiveis.forEach(processo => {
            for (let i = 0; i < processo.bilhetes; i++) {
                bilhetesDistribuidos.push(processo.id);
                totalBilhetes++;
            }
        });

        // Selecionar um bilhete aleatoriamente
        const bilheteSorteado = Math.floor(Math.random() * totalBilhetes);
        const processoSorteadoId = bilhetesDistribuidos[bilheteSorteado];
        
        // Encontrar o processo sorteado
        const processoSorteado = processosDisponiveis.find(p => p.id === processoSorteadoId);

        // Verificar se houve mudança de processo
        if (processoAtualId !== processoSorteado.id) {
            // Se havia um processo em execução, finalizar seu bloco
            if (processoAtualId !== null && resultado.execucao.length > 0) {
                resultado.execucao[resultado.execucao.length - 1].fim = tempoAtual;
            }
            
            processoAtualId = processoSorteado.id;

            // Registrar o tempo de resposta (primeira execução)
            if (processoSorteado.tempoResposta === -1) {
                processoSorteado.tempoResposta = tempoAtual - processoSorteado.chegada;
            }

            // Registrar o tempo de início de execução se for a primeira execução
            if (processoSorteado.inicioExecucao === null) {
                processoSorteado.inicioExecucao = tempoAtual;
            }

            // Iniciar um novo bloco de execução
            resultado.execucao.push({
                tipo: 'processo',
                processo: processoSorteado.id,
                inicio: tempoAtual,
                fim: null // Será definido posteriormente
            });
        }

        // Calcular o tempo que este processo vai executar neste momento
        const tempoExecucao = Math.min(quantum, processoSorteado.tempoRestante);
        
        // Atualizar a última vez que o processo foi executado
        processoSorteado.ultimaExecucao = tempoAtual;

        // Atualizar o tempo restante do processo
        processoSorteado.tempoRestante -= tempoExecucao;
        tempoAtual += tempoExecucao;

        // Verificar se o processo terminou
        if (processoSorteado.tempoRestante <= 0) {
            // Processo concluído
            processoSorteado.concluido = true;
            processosRestantes--;

            // Calcular métricas para este processo
            processoSorteado.tempoRetorno = tempoAtual - processoSorteado.chegada;
            processoSorteado.tempoEspera = processoSorteado.tempoRetorno - processoSorteado.duracao;

            // Adicionar métricas deste processo ao resultado
            resultado.metricas.processos.push({
                id: processoSorteado.id,
                tempoEspera: processoSorteado.tempoEspera,
                tempoRetorno: processoSorteado.tempoRetorno,
                tempoResposta: processoSorteado.tempoResposta
            });

            // Finalizar o bloco de execução atual
            resultado.execucao[resultado.execucao.length - 1].fim = tempoAtual;
            processoAtualId = null;
        } else {
            // Se o quantum terminou, finalizar o bloco atual
            if (tempoExecucao === quantum) {
                resultado.execucao[resultado.execucao.length - 1].fim = tempoAtual;
                processoAtualId = null;
            }
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
 * @param {Number} quantum - Valor do quantum (opcional)
 * @return {Object} Objeto com status e mensagem de erro, se houver
 */
function validarParametrosLoteria(processos, quantum) {
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

        // Verificar bilhetes (se fornecido)
        if (p.bilhetes !== undefined && (typeof p.bilhetes !== 'number' || p.bilhetes <= 0)) {
            return { 
                valido: false, 
                mensagem: `Processo ${p.id} tem número de bilhetes inválido. O número de bilhetes deve ser maior que zero.` 
            };
        }
    }

    // Verificar quantum (se fornecido)
    if (quantum !== undefined && (typeof quantum !== 'number' || quantum <= 0)) {
        return { 
            valido: false, 
            mensagem: 'Valor de quantum inválido. O quantum deve ser maior que zero.' 
        };
    }

    return { valido: true };
}

/**
 * Função principal que executa o algoritmo de Loteria com validação
 * @param {Array} processos - Array de objetos de processo
 * @param {Number} quantum - Valor do quantum (opcional)
 * @return {Object} Resultado da execução ou objeto de erro
 */
function executarLoteria(processos, quantum) {
    // Validar parâmetros
    const validacao = validarParametrosLoteria(processos, quantum);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return escalonamentoLoteria(processos, quantum);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo de Loteria: ' + error.message 
        };
    }
}

// Função wrapper para manter a consistência com os outros algoritmos
function LOTERIA(processos, quantum) {
    return executarLoteria(processos, quantum);
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarLoteria,
        escalonamentoLoteria,
        validarParametrosLoteria,
        LOTERIA
    };
}