/**
 * Implementação do algoritmo de escalonamento por Prioridade
 * 
 * O algoritmo de Prioridade executa os processos de acordo com um valor de prioridade atribuído.
 * Quanto menor o número, maior a prioridade. Este algoritmo é preemptivo, ou seja,
 * quando um processo de maior prioridade chega, o processo atual é interrompido.
 */

/**
 * Executa o algoritmo de escalonamento por Prioridade
 * @param {Array} processos - Array de objetos de processo: {id, chegada, duracao, prioridade}
 * @return {Object} Resultado da execução com timeline e métricas
 */
function escalonamentoPrioridade(processos) {
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

    // Ordenar por tempo de chegada (para processos que chegam no mesmo instante)
    processosCopia.sort((a, b) => a.chegada - b.chegada);

    // Resultado da execução
    const resultado = {
        algoritmo: 'PRIORIDADE',
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
    let processoAtualIndex = -1;
    let idleTime = 0;

    // Continuar até que todos os processos sejam concluídos
    while (processosRestantes > 0) {
        // Encontrar o processo de maior prioridade (menor número) que já chegou e não foi concluído
        let maiorPrioridadeIndex = -1;
        let maiorPrioridade = Infinity;

        for (let i = 0; i < processosCopia.length; i++) {
            const processo = processosCopia[i];
            if (!processo.concluido && processo.chegada <= tempoAtual && processo.prioridade < maiorPrioridade) {
                maiorPrioridadeIndex = i;
                maiorPrioridade = processo.prioridade;
            }
        }

        // Se não há processos disponíveis no momento, avançar o tempo
        if (maiorPrioridadeIndex === -1) {
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
                console.error('Erro no algoritmo: sem processos disponíveis e nenhum processo para chegar');
                break;
            }
            continue;
        }

        // Se houve mudança de processo
        if (processoAtualIndex !== maiorPrioridadeIndex) {
            processoAtualIndex = maiorPrioridadeIndex;
            const processoAtual = processosCopia[processoAtualIndex];

            // Registrar o tempo de resposta (primeira execução)
            if (processoAtual.tempoResposta === -1) {
                processoAtual.tempoResposta = tempoAtual - processoAtual.chegada;
            }

            // Registrar o tempo de início de execução se for a primeira execução
            if (processoAtual.inicioExecucao === null) {
                processoAtual.inicioExecucao = tempoAtual;
            }
        }

        const processoAtual = processosCopia[processoAtualIndex];
        let tempoExecucao = 1; // Executar por 1 unidade de tempo
        
        // Atualizar a última vez que o processo foi executado
        processoAtual.ultimaExecucao = tempoAtual;

        // Adicionar esta execução ao resultado
        // Verificar se podemos unir com a execução anterior do mesmo processo
        const ultimaExecucao = resultado.execucao.length > 0 ? resultado.execucao[resultado.execucao.length - 1] : null;
        
        if (ultimaExecucao && 
            ultimaExecucao.tipo === 'processo' && 
            ultimaExecucao.processo === processoAtual.id && 
            ultimaExecucao.fim === tempoAtual) {
            // Estender a execução anterior
            ultimaExecucao.fim = tempoAtual + tempoExecucao;
        } else {
            // Criar nova entrada de execução
            resultado.execucao.push({
                tipo: 'processo',
                processo: processoAtual.id,
                inicio: tempoAtual,
                fim: tempoAtual + tempoExecucao
            });
        }

        // Atualizar o tempo restante do processo
        processoAtual.tempoRestante -= tempoExecucao;
        tempoAtual += tempoExecucao;

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

            // Resetar o índice do processo atual
            processoAtualIndex = -1;
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
 * @return {Object} Objeto com status e mensagem de erro, se houver
 */
function validarParametrosPrioridade(processos) {
    if (!Array.isArray(processos) || processos.length === 0) {
        return { valido: false, mensagem: 'Lista de processos vazia ou inválida' };
    }

    // Verificar se cada processo tem os campos necessários
    for (let i = 0; i < processos.length; i++) {
        const p = processos[i];
        if (!p.id || typeof p.chegada !== 'number' || typeof p.duracao !== 'number' || typeof p.prioridade !== 'number') {
            return { 
                valido: false, 
                mensagem: `Processo ${i+1} tem campos inválidos. Cada processo deve ter id, chegada, duracao e prioridade.` 
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

        if (p.prioridade < 1) {
            return { 
                valido: false, 
                mensagem: `Processo ${p.id} tem prioridade inválida. A prioridade deve ser maior ou igual a 1.` 
            };
        }
    }

    return { valido: true };
}

/**
 * Função principal que executa o algoritmo de Prioridade com validação
 * @param {Array} processos - Array de objetos de processo
 * @return {Object} Resultado da execução ou objeto de erro
 */
function executarPrioridade(processos) {
    // Validar parâmetros
    const validacao = validarParametrosPrioridade(processos);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return escalonamentoPrioridade(processos);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo de Prioridade: ' + error.message 
        };
    }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarPrioridade,
        escalonamentoPrioridade,
        validarParametrosPrioridade
    };
}