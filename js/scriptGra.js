// Variável global para controlar a pausa da animação
let animacaoPausada = false;
let velocidadeAnimacao = 1000; // Tempo em ms entre cada bloco

document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados do localStorage
    const dados = carregarDados();
    if (!dados) return;
    
    // Configurar botões
    configurarBotoes();
    
    try {
        // Executar algoritmo e renderizar resultados
        const resultadoExecucao = executarAlgoritmo(dados.processos, dados.algoritmo, dados.quantum);
        if (!resultadoExecucao) {
            throw new Error(`O algoritmo ${dados.algoritmo} não retornou um resultado válido`);
        }
        
        // Normalizar e processar o resultado
        const resultadoNormalizado = normalizarResultado(resultadoExecucao);
        
        // Renderizar visualização
        prepararGrafico(resultadoNormalizado);
        iniciarAnimacao(resultadoNormalizado);
        exibirMetricas(resultadoNormalizado);
        exibirInformacoes(dados, resultadoNormalizado);
    } catch (error) {
        console.error("Erro ao executar o algoritmo:", error);
        alert(`Ocorreu um erro ao executar o algoritmo: ${error.message}`);
    }
});

/**
 * Carrega os dados do localStorage
 * @returns {Object|null} Dados carregados ou null se não existirem
 */
function carregarDados() {
    const processosStr = localStorage.getItem('processos');
    const algoritmo = localStorage.getItem('algoritmo');
    const quantum = localStorage.getItem('quantum');
    
    if (!processosStr || !algoritmo) {
        alert('Nenhum dado de simulação encontrado. Voltando para a página inicial.');
        window.location.href = '../index.html';
        return null;
    }
    
    return {
        processos: JSON.parse(processosStr),
        algoritmo,
        quantum: quantum ? parseInt(quantum) : undefined
    };
}

/**
 * Configura os botões da interface
 */
function configurarBotoes() {
    // Botão voltar
    document.getElementById('btn-voltar')?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // Botão nova simulação
    document.getElementById('btn-nova-simulacao')?.addEventListener('click', () => {
        localStorage.removeItem('processos');
        localStorage.removeItem('algoritmo');
        localStorage.removeItem('quantum');
        window.location.href = '../index.html';
    });
    
    // Botão pausar 
    const btnPausar = document.getElementById('btn-pausar');
    if (btnPausar) {
        btnPausar.addEventListener('click', () => {
            animacaoPausada = !animacaoPausada;
            btnPausar.textContent = animacaoPausada ? 'Continuar' : 'Pausar';
        });
    }
}

/**
 * Executa o algoritmo selecionado
 * @param {Array} processos Lista de processos
 * @param {string} algoritmo Nome do algoritmo
 * @param {number} quantum Quantum para Round Robin
 * @returns {Object} Resultado da execução
 */
function executarAlgoritmo(processos, algoritmo, quantum) {
    console.log(`Executando algoritmo: ${algoritmo}`);
    
    // Verificar se as funções dos algoritmos estão definidas
    if (typeof window[algoritmo] !== 'function') {
        console.error(`Algoritmo ${algoritmo} não está definido`);
        throw new Error(`Algoritmo ${algoritmo} não está definido. Verifique se o script foi carregado.`);
    }
    
    let resultado;
    
    switch(algoritmo) {
        case 'FCFS':
            resultado = FCFS(processos);
            break;
        case 'SJF':
            resultado = SJF(processos);
            break;
        case 'SRTF':
            resultado = SRTF(processos);
            break;
        case 'RR':
            resultado = RR(processos, quantum);
            break;
        case 'PRIORIDADE':
            resultado = Prioridade(processos);
            break;
        case 'LOTERIA':
            resultado = LOTERIA(processos, quantum);
            break;
        default:
            throw new Error(`Algoritmo não implementado: ${algoritmo}`);
    
    }
    
    console.log("Resultado da execução:", resultado);
    return resultado;
}

/**
 * Normaliza o resultado para o formato esperado
 * @param {Object} resultado Resultado da execução do algoritmo
 * @returns {Object} Resultado normalizado
 */
function normalizarResultado(resultado) {
    // Se o resultado já estiver no formato esperado, retorná-lo diretamente
    if (resultado?.processos && resultado?.ganttChart && resultado?.metricas) {
        return resultado;
    }
    
    // Criar um objeto com a estrutura esperada
    const resultadoNormalizado = {
        processos: [],
        ganttChart: [],
        metricas: {
            tempoEsperaMedio: 0,
            tempoTurnaroundMedio: 0
        }
    };
    
    // Extrair processos
    if (Array.isArray(resultado?.processos)) {
        resultadoNormalizado.processos = resultado.processos;
    } else if (Array.isArray(resultado)) {
        resultadoNormalizado.processos = resultado;
    }
    
    // Extrair gráfico de Gantt
    if (Array.isArray(resultado?.ganttChart)) {
        resultadoNormalizado.ganttChart = resultado.ganttChart;
    } else if (resultado?.execucao && Array.isArray(resultado.execucao)) {
        resultadoNormalizado.ganttChart = resultado.execucao;
    }
    
    // Extrair métricas
    if (resultado?.metricas) {
        resultadoNormalizado.metricas = resultado.metricas;
    }
    
    // Verificar e corrigir dados ausentes
    if (resultadoNormalizado.processos.length === 0 && resultadoNormalizado.ganttChart.length > 0) {
        const processosUnicos = [...new Set(resultadoNormalizado.ganttChart.map(b => b.processo))];
        resultadoNormalizado.processos = processosUnicos.map(nome => ({ nome }));
    }
    
    return resultadoNormalizado;
}

/**
 * Prepara o gráfico para animação
 * @param {Object} resultado Resultado normalizado
 */
function prepararGrafico(resultado) {
    const ganttChart = document.getElementById('gantt-chart');
    ganttChart.innerHTML = ''; // Limpar conteúdo anterior
    
    // Extrair processos únicos
    const processosUnicos = extrairProcessosUnicos(resultado);
    
    // Determinar o tempo total
    const tempoTotal = calcularTempoTotal(resultado);
    
    // Criar indicadores de tempo
    criarIndicadoresTempo(tempoTotal);
    
    // Criar linhas para cada processo
    processosUnicos.forEach(processoNome => {
        criarLinhaProcesso(processoNome, ganttChart);
    });
}

/**
 * Extrai a lista de processos únicos
 * @param {Object} resultado Resultado normalizado
 * @returns {Array} Lista de nomes de processos únicos
 */
function extrairProcessosUnicos(resultado) {
    // Verificar se os processos têm a propriedade 'nome' ou 'id'
    if (resultado.processos.length > 0) {
        if (resultado.processos[0].nome) {
            return [...new Set(resultado.processos.map(p => p.nome))];
        } else if (resultado.processos[0].id) {
            return [...new Set(resultado.processos.map(p => p.id))];
        }
    }
    
    // Extrair processos únicos do gráfico de Gantt
    return [...new Set(resultado.ganttChart.map(b => b.processo))];
}

/**
 * Calcula o tempo total da simulação
 * @param {Object} resultado Resultado normalizado
 * @returns {number} Tempo total
 */
function calcularTempoTotal(resultado) {
    // Verificar se os processos têm a propriedade 'conclusao'
    if (resultado.processos.length > 0 && resultado.processos[0].conclusao) {
        return Math.max(...resultado.processos.map(p => p.conclusao));
    }
    
    // Usar o tempo final do último bloco do gráfico de Gantt
    return Math.max(...resultado.ganttChart.map(b => b.fim));
}

/**
 * Cria os indicadores de tempo no gráfico
 * @param {number} tempoTotal Tempo total da simulação
 */
function criarIndicadoresTempo(tempoTotal) {
    const timeIndicators = document.getElementById('time-indicators');
    timeIndicators.innerHTML = '';
    
    // Determinar o intervalo ideal para as marcações
    const intervalo = Math.max(1, Math.ceil(tempoTotal / 20));
    
    // Adicionar marcações de tempo
    for (let i = 0; i <= tempoTotal; i += intervalo) {
        const timeMarker = document.createElement('div');
        timeMarker.className = 'time-marker';
        timeMarker.style.left = `${(i / tempoTotal) * 100}%`;
        timeMarker.textContent = i;
        timeIndicators.appendChild(timeMarker);
    }
}

/**
 * Cria uma linha para um processo no gráfico
 * @param {string} processoNome Nome do processo
 * @param {HTMLElement} ganttChart Elemento do gráfico de Gantt
 */
function criarLinhaProcesso(processoNome, ganttChart) {
    const processRow = document.createElement('div');
    processRow.className = 'process-row';
    processRow.id = `row-${processoNome}`;
    
    // Adicionar label do processo
    const processLabel = document.createElement('div');
    processLabel.className = 'process-label';
    processLabel.textContent = processoNome;
    processRow.appendChild(processLabel);
    
    // Criar timeline para este processo
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    timeline.id = `timeline-${processoNome}`;
    processRow.appendChild(timeline);
    
    ganttChart.appendChild(processRow);
}

/**
 * Inicia a animação do gráfico
 * @param {Object} resultado Resultado normalizado
 */
function iniciarAnimacao(resultado) {
    const tempoTotal = calcularTempoTotal(resultado);
    const ganttChart = [...resultado.ganttChart].sort((a, b) => a.inicio - b.inicio);
    
    let indiceAtual = 0;
    
    // Função para animar um bloco
    function animarProximoBloco() {
        // Verificar se a animação está pausada
        if (animacaoPausada) {
            setTimeout(animarProximoBloco, 500);
            return;
        }
        
        if (indiceAtual >= ganttChart.length) {
            console.log("Animação concluída!");
            return;
        }
        
        const bloco = ganttChart[indiceAtual];
        const timeline = document.getElementById(`timeline-${bloco.processo}`);
        
        if (!timeline) {
            console.error(`Timeline não encontrada para o processo ${bloco.processo}`);
            indiceAtual++;
            setTimeout(animarProximoBloco, velocidadeAnimacao);
            return;
        }
        
        // Criar e animar o bloco
        criarBlocoAnimado(bloco, timeline, tempoTotal);
        
        // Avançar para o próximo bloco
        indiceAtual++;
        setTimeout(animarProximoBloco, velocidadeAnimacao);
    }
    
    // Iniciar a animação
    animarProximoBloco();
}

/**
 * Cria um bloco animado no gráfico
 * @param {Object} bloco Bloco de execução
 * @param {HTMLElement} timeline Elemento da timeline
 * @param {number} tempoTotal Tempo total da simulação
 */
function criarBlocoAnimado(bloco, timeline, tempoTotal) {
    const block = document.createElement('div');
    block.className = 'process-block';
    block.style.left = `${(bloco.inicio / tempoTotal) * 100}%`;
    block.style.width = `${((bloco.fim - bloco.inicio) / tempoTotal) * 100}%`;
    block.title = `${bloco.processo}: ${bloco.inicio} - ${bloco.fim}`;
    block.textContent = bloco.fim - bloco.inicio;
    
    // Adicionar efeito de animação
    block.style.opacity = '0';
    timeline.appendChild(block);
    
    // Animar o aparecimento do bloco
    setTimeout(() => {
        block.style.transition = 'opacity 0.5s ease-in-out';
        block.style.opacity = '1';
    }, 100);
}

/**
 * Exibe as informações dos processos e do algoritmo selecionado
 * @param {Object} dados Dados carregados do localStorage
 * @param {Object} resultado Resultado normalizado
 */
function exibirInformacoes(dados, resultado) {
    // Exibir nome do algoritmo
    document.getElementById('algoritmo-nome').textContent = dados.algoritmo;
    
    // Exibir quantum (se aplicável)
    const quantumCard = document.getElementById('quantum-card');
    if (dados.algoritmo === 'RR' || dados.algoritmo === 'LOTERIA') {
        document.getElementById('quantum-valor').textContent = dados.quantum;
        quantumCard.style.display = 'block';
    } else {
        quantumCard.style.display = 'none';
    }
    
    // Exibir informações dos processos
    const tabelaProcessos = document.getElementById('processos-tabela').getElementsByTagName('tbody')[0];
    tabelaProcessos.innerHTML = '';
    
    dados.processos.forEach(processo => {
        const row = document.createElement('tr');
        
        // Coluna do nome do processo
        const tdNome = document.createElement('td');
        tdNome.textContent = processo.nome || processo.id;
        row.appendChild(tdNome);
        
        // Coluna do tempo de chegada
        const tdChegada = document.createElement('td');
        tdChegada.textContent = processo.chegada !== undefined ? processo.chegada : 'N/A';
        row.appendChild(tdChegada);
        
        // Coluna do tempo de execução
        const tdExecucao = document.createElement('td');
        tdExecucao.textContent = processo.duracao || processo.tempoExecucao || 'N/A';
        row.appendChild(tdExecucao);
        
        // Coluna da prioridade
        const tdPrioridade = document.createElement('td');
        tdPrioridade.textContent = processo.prioridade !== undefined ? processo.prioridade : 'N/A';
        row.appendChild(tdPrioridade);
        
        tabelaProcessos.appendChild(row);
    });
}

/**
 * Função vazia para manter compatibilidade com o código existente
 * @param {Object} resultado Resultado normalizado
 */
function exibirMetricas(resultado) {
    // Função mantida vazia para compatibilidade
    console.log("Métricas de desempenho foram desativadas");
}