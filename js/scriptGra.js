document.addEventListener('DOMContentLoaded', function() {
    // Verificar se existem dados de processos no localStorage
    const processosStr = localStorage.getItem('processos');
    const algoritmo = localStorage.getItem('algoritmo');
    const quantum = localStorage.getItem('quantum');
    
    if (!processosStr || !algoritmo) {
        alert('Nenhum dado de simulação encontrado. Voltando para a página inicial.');
        window.location.href = '../index.html';
        return;
    }
    
    const processos = JSON.parse(processosStr);
    
    // Executar o algoritmo selecionado
    let resultadoExecucao;
    
    try {
        switch(algoritmo) {
            case 'FCFS':
                resultadoExecucao = executarFCFS(processos);
                break;
            case 'SJF':
                resultadoExecucao = executarSJF(processos);
                break;
            case 'SRTF':
                resultadoExecucao = executarSRTF(processos);
                break;
            case 'RR':
                resultadoExecucao = executarRR(processos, parseInt(quantum));
                break;
            case 'PRIORIDADE':
                resultadoExecucao = executarPrioridade(processos);
                break;
            case 'MULTIPROCESSO':
                // Implementar lógica para multiprocessamento
                resultadoExecucao = gerarResultadoExemplo(processos, algoritmo);
                break;
            default:
                resultadoExecucao = gerarResultadoExemplo(processos, algoritmo);
        }
        
        // Renderizar o gráfico de Gantt com o resultado da execução
        renderizarGrafico(resultadoExecucao);
        
        // Calcular e exibir métricas
        exibirMetricas(resultadoExecucao);
    } catch (error) {
        console.error("Erro ao executar o algoritmo:", error);
        alert("Ocorreu um erro ao executar o algoritmo: " + error.message);
    }
    
    // Adicionar evento aos botões
    document.getElementById('btn-voltar').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
    
    document.getElementById('btn-nova-simulacao').addEventListener('click', function() {
        localStorage.removeItem('processos');
        localStorage.removeItem('algoritmo');
        localStorage.removeItem('quantum');
        window.location.href = '../index.html';
    });
});

// Função para renderizar o gráfico de Gantt
function renderizarGrafico(resultado) {
    const ganttChart = document.getElementById('gantt-chart');
    ganttChart.innerHTML = ''; // Limpar conteúdo anterior
    
    // Criar linhas para cada processo
    const processosUnicos = [...new Set(resultado.execucao
        .filter(e => e.tipo === 'processo')
        .map(e => e.processo))];
    
    // Determinar o tempo total para escala
    const tempoTotal = resultado.tempoTotal;
    
    // Criar indicadores de tempo
    const timeIndicators = document.getElementById('time-indicators');
    timeIndicators.innerHTML = '';
    
    // Adicionar marcações de tempo
    for (let i = 0; i <= tempoTotal; i += Math.max(1, Math.floor(tempoTotal / 20))) {
        const timeMarker = document.createElement('div');
        timeMarker.className = 'time-marker';
        timeMarker.style.left = `${(i / tempoTotal) * 100}%`;
        timeMarker.textContent = i;
        timeIndicators.appendChild(timeMarker);
    }
    
    // Criar linha para cada processo
    processosUnicos.forEach(processoId => {
        const processRow = document.createElement('div');
        processRow.className = 'process-row';
        
        // Adicionar label do processo
        const processLabel = document.createElement('div');
        processLabel.className = 'process-label';
        processLabel.textContent = processoId;
        processRow.appendChild(processLabel);
        
        // Criar timeline para este processo
        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        processRow.appendChild(timeline);
        
        // Adicionar blocos de execução para este processo
        resultado.execucao
            .filter(e => e.tipo === 'processo' && e.processo === processoId)
            .forEach(execucao => {
                const block = document.createElement('div');
                block.className = 'process-block';
                block.style.left = `${(execucao.inicio / tempoTotal) * 100}%`;
                block.style.width = `${((execucao.fim - execucao.inicio) / tempoTotal) * 100}%`;
                block.title = `${processoId}: ${execucao.inicio} - ${execucao.fim}`;
                block.textContent = execucao.fim - execucao.inicio;
                timeline.appendChild(block);
            });
        
        ganttChart.appendChild(processRow);
    });
}

// Função para exibir métricas
function exibirMetricas(resultado) {
    document.getElementById('tempo-espera').textContent = 
        resultado.metricas.tempoMedioEspera.toFixed(2);
    
    document.getElementById('tempo-retorno').textContent = 
        resultado.metricas.tempoMedioRetorno.toFixed(2);
    
    document.getElementById('throughput').textContent = 
        resultado.metricas.throughput.toFixed(2);
    
    document.getElementById('utilizacao-cpu').textContent = 
        resultado.metricas.utilizacaoCPU.toFixed(2) + '%';
}

// Função para gerar um resultado de exemplo (caso necessário)
function gerarResultadoExemplo(processos, algoritmo) {
    // Implementação básica para testes
    const resultado = {
        algoritmo: algoritmo,
        tempoTotal: 0,
        execucao: [],
        metricas: {
            tempoEspera: [],
            tempoRetorno: []
        }
    };
    
    let tempoAtual = 0;
    
    // Para cada processo, simula uma execução aleatória
    processos.forEach(processo => {
        // Adiciona um tempo de espera entre 0 e 5
        const espera = Math.floor(Math.random() * 5);
        tempoAtual += espera;
        
        // Adiciona a execução ao resultado
        resultado.execucao.push({
            processo: processo.id,
            inicio: tempoAtual,
            fim: tempoAtual + processo.duracao
        });
        
        // Avança o tempo
        tempoAtual += processo.duracao;
        
        // Calcula métricas
        resultado.metricas.tempoEspera.push({
            processo: processo.id,
            valor: tempoAtual - processo.chegada - processo.duracao
        });
        
        resultado.metricas.tempoRetorno.push({
            processo: processo.id,
            valor: tempoAtual - processo.chegada
        });
    });
    
    resultado.tempoTotal = tempoAtual;
    return resultado;
}