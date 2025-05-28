/**
 * Implementação do algoritmo de escalonamento Shortest Job First (SJF)
 * 
 * O SJF é um algoritmo não-preemptivo que prioriza a execução do processo com menor
 * tempo de execução (duração). Uma vez que um processo começa a ser executado, ele
 * continua até terminar. SJF é ótimo em termos de tempo médio de espera, mas pode
 * causar starvation em processos com tempos de execução longos.
 */

/**
 * Executa o algoritmo de escalonamento Shortest Job First
 */
function shortestJobFirst(processos) {
    // Clonar os processos para não modificar o array original
    const processosCopia = processos.map(p => ({
        ...p,
        inicioExecucao: null,        // Quando o processo começou a executar
        fimExecucao: null,           // Quando o processo terminou de executar
        tempoEspera: 0,              // Tempo total de espera
        tempoRetorno: 0,             // Tempo de retorno (turnaround)
        tempoResposta: 0,            // Tempo de resposta (primeira execução)
        concluido: false             // Indica se o processo já foi concluído
    }));

    // Resultado da execução
    const resultado = {
        algoritmo: 'SJF',
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

    // Continuar até que todos os processos sejam concluídos
    while (processosRestantes > 0) {
        // Filtrar processos que já chegaram e não foram concluídos
        const processosProntos = processosCopia.filter(p => 
            p.chegada <= tempoAtual && !p.concluido
        );

        // Se não há processos prontos, avançar o tempo até o próximo processo chegar
        if (processosProntos.length === 0) {
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
                console.error('Erro no algoritmo: sem processos prontos e nenhum processo para chegar');
                break;
            }
            continue;
        }

        // Selecionar o processo com menor tempo de execução
        const processoAtual = processosProntos.sort((a, b) => a.duracao - b.duracao)[0];

        // Registrar início da execução
        processoAtual.inicioExecucao = tempoAtual;
        
        // Calcular tempo de espera e tempo de resposta
        processoAtual.tempoEspera = tempoAtual - processoAtual.chegada;
        processoAtual.tempoResposta = processoAtual.tempoEspera; // No SJF, tempo de espera e resposta são iguais para cada processo
        
        // Registrar execução do processo
        resultado.execucao.push({
            tipo: 'processo',
            processo: processoAtual.id,
            inicio: tempoAtual,
            fim: tempoAtual + processoAtual.duracao
        });
        
        // Avançar o tempo
        tempoAtual += processoAtual.duracao;
        
        // Registrar fim da execução
        processoAtual.fimExecucao = tempoAtual;
        processoAtual.concluido = true;
        processosRestantes--;
        
        // Calcular tempo de retorno (turnaround)
        processoAtual.tempoRetorno = processoAtual.fimExecucao - processoAtual.chegada;
        
        // Adicionar métricas do processo ao resultado
        resultado.metricas.processos.push({
            id: processoAtual.id,
            tempoEspera: processoAtual.tempoEspera,
            tempoRetorno: processoAtual.tempoRetorno,
            tempoResposta: processoAtual.tempoResposta
        });
    }

    return resultado;
}

/**
 * Valida os parâmetros de entrada do algoritmo
 */
function validarParametrosSJF(processos) {
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
 * Função principal que executa o algoritmo SJF com validação
 */
function executarSJF(processos) {
    // Validar parâmetros
    const validacao = validarParametrosSJF(processos);
    if (!validacao.valido) {
        return { 
            erro: true, 
            mensagem: validacao.mensagem 
        };
    }

    try {
        // Executar o algoritmo
        return shortestJobFirst(processos);
    } catch (error) {
        return { 
            erro: true, 
            mensagem: 'Erro ao executar o algoritmo SJF: ' + error.message 
        };
    }
}

// Função wrapper para manter a consistência com os outros algoritmos
function SJF(processos) {
    return executarSJF(processos);
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarSJF,
        SJF
    };
}