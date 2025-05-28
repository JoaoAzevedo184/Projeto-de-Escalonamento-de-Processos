/**
 * Implementação do algoritmo de escalonamento Shortest Remaining Time First (SRTF)
 * 
 * O SRTF é a versão preemptiva do SJF. Neste algoritmo, o processo com o menor
 * tempo restante de execução é selecionado para execução. Se um novo processo
 * chega com tempo de execução menor que o tempo restante do processo atual,
 * ocorre preempção (o processo atual é interrompido em favor do novo).
 */

/**
 * Executa o algoritmo de escalonamento SRTF
 */
function shortestRemainingTimeFirst(processos) {
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
        algoritmo: 'SRTF',
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
    let processoAtualId = null;
    let idleTime = 0;

    // Continuar até que todos os processos sejam concluídos
    while (processosRestantes > 0) {
        let processoMenorTempoRestante = null;
        let menorTempoRestante = Infinity;

        // Encontrar o processo com menor tempo restante entre os processos que já chegaram
        for (let i = 0; i < processosCopia.length; i++) {
            const processo = processosCopia[i];
            if (!processo.concluido && processo.chegada <= tempoAtual && processo.tempoRestante < menorTempoRestante) {
                menorTempoRestante = processo.tempoRestante;
                processoMenorTempoRestante = processo;
            }
        }

        // Se não encontrar nenhum processo disponível, avança o tempo até o próximo processo chegar
        if (!processoMenorTempoRestante) {
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

        // Se houver uma troca de processo, finalize o bloco anterior e inicie um novo
        if (processoAtualId !== processoMenorTempoRestante.id) {
            processoAtualId = processoMenorTempoRestante.id;
            
            // Registrar o tempo de resposta (primeira vez que o processo é executado)
            if (processoMenorTempoRestante.tempoResposta === -1) {
                processoMenorTempoRestante.tempoResposta = tempoAtual - processoMenorTempoRestante.chegada;
            }

            // Registrar o tempo de início de execução se for a primeira execução
            if (processoMenorTempoRestante.inicioExecucao === null) {
                processoMenorTempoRestante.inicioExecucao = tempoAtual;
            }

            // Atualizar a última vez que o processo foi executado
            processoMenorTempoRestante.ultimaExecucao = tempoAtual;

            // Iniciar um novo bloco de execução
            const novoBloco = {
                tipo: 'processo',
                processo: processoMenorTempoRestante.id,
                inicio: tempoAtual,
                fim: null // Será definido posteriormente
            };
            resultado.execucao.push(novoBloco);
        }

        // Executar o processo por 1 unidade de tempo
        tempoAtual++;
        processoMenorTempoRestante.tempoRestante--;

        // Verificar se o processo terminou
        if (processoMenorTempoRestante.tempoRestante <= 0) {
            // Processo concluído
            processoMenorTempoRestante.concluido = true;
            processosRestantes--;

            // Calcular métricas para este processo
            processoMenorTempoRestante.tempoRetorno = tempoAtual - processoMenorTempoRestante.chegada;
            processoMenorTempoRestante.tempoEspera = processoMenorTempoRestante.tempoRetorno - processoMenorTempoRestante.duracao;

            // Adicionar métricas deste processo ao resultado
            resultado.metricas.processos.push({
                id: processoMenorTempoRestante.id,
                tempoEspera: processoMenorTempoRestante.tempoEspera,
                tempoRetorno: processoMenorTempoRestante.tempoRetorno,
                tempoResposta: processoMenorTempoRestante.tempoResposta
            });

            // Marcar o fim deste bloco de execução
            resultado.execucao[resultado.execucao.length - 1].fim = tempoAtual;
            processoAtualId = null;
        } else {
            // Verificar se precisamos fazer preempção no próximo ciclo
            let novoProcessoPreemptivo = false;
            
            // Verificar se há algum processo chegando no próximo ciclo com tempo menor
            for (let i = 0; i < processosCopia.length; i++) {
                const processo = processosCopia[i];
                if (!processo.concluido && processo.chegada === tempoAtual && 
                    processo.tempoRestante < processoMenorTempoRestante.tempoRestante) {
                    novoProcessoPreemptivo = true;
                    break;
                }
            }
            
            // Se houver preempção ou o processo terminou, finalize o bloco atual
            if (novoProcessoPreemptivo) {
                resultado.execucao[resultado.execucao.length - 1].fim = tempoAtual;
                processoAtualId = null;
            }
        }
    }

    return resultado;
}

/**
 * Valida os parâmetros de entrada do algoritmo
 */
function validarParametrosSRTF(processos) {
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
 * Função principal que executa o algoritmo SRTF com validação
 */
function executarSRTF(processos) {
    // Validar parâmetros
    const validacao = validarParametrosSRTF(processos);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return shortestRemainingTimeFirst(processos);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo SRTF: ' + error.message 
        };
    }
}

// Função wrapper para manter a consistência com os outros algoritmos
function SRTF(processos) {
    return executarSRTF(processos);
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarSRTF,
        shortestRemainingTimeFirst,
        validarParametrosSRTF,
        SRTF
    };
}