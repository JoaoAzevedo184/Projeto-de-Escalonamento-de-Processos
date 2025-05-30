/**
 * Script principal para o simulador de escalonamento de processos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Explicações dos algoritmos
    const algoritmos = {
        'RR': 'O Round Robin é um algoritmo de escalonamento que define um intervalo de tempo fixo para cada processo, chamado quantum. Cada processo recebe um quantum de tempo para executar e, se não terminar, volta para o final da fila.',
        
        'FCFS': 'First Come First Serve (FCFS) é o algoritmo mais simples, onde os processos são executados na ordem em que chegam, sem interrupção. O primeiro processo a chegar é o primeiro a ser executado completamente.',
        
        'SJF': 'Shortest Job First (SJF) prioriza a execução do processo com menor tempo de execução. É um algoritmo não preemptivo que pode causar starvation em processos longos.',
        
        'SRTF': 'Shortest Remaining Time First (SRTF) é a versão preemptiva do SJF. O processo em execução pode ser interrompido se chegar um novo processo com tempo de execução menor que o tempo restante do processo atual.',
        
        'PRIORIDADE': 'O escalonamento por Prioridade executa os processos de acordo com um valor de prioridade atribuído. Quanto menor o número, maior a prioridade. Pode usar preempção quando um processo de maior prioridade chega.',
        
        'Loteria': 'O escalonamento por Loteria atribui bilhetes a cada processo, e um bilhete é sorteado para determinar qual processo será executado. Isso permite uma forma de justiça e aleatoriedade no escalonamento.'
    };

    // Exibir explicação ao selecionar um algoritmo
    const radioButtons = document.querySelectorAll('input[name="algoritmo"]');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove explicação anterior se existir
            const explicacaoAnterior = document.querySelector('.explicacao-algoritmo');
            if (explicacaoAnterior) {
                explicacaoAnterior.remove();
            }

            // Cria e adiciona nova explicação
            if (this.checked) {
                const explicacao = document.createElement('div');
                explicacao.className = 'explicacao-algoritmo active';
                explicacao.innerHTML = `<p>${algoritmos[this.value]}</p>`;
                this.closest('section').appendChild(explicacao);
            }
        });
    });

    // Adicionar evento ao botão de gerar processos
    const btnGerarProcessos = document.getElementById('btnGerarProcessos');
    btnGerarProcessos.addEventListener('click', function() {
        // Obter a quantidade de processos
        const qtdProcessos = document.getElementById('QuantidadeProcessos').value;
        
        // Validar entrada
        if (!qtdProcessos || qtdProcessos < 1 || qtdProcessos > 10) {
            alert('Por favor, selecione uma quantidade de processos entre 1 e 10.');
            return;
        }

        // Obter o algoritmo selecionado
        let algoritmoSelecionado = "";
        document.querySelectorAll('input[name="algoritmo"]').forEach(radio => {
            if (radio.checked) {
                algoritmoSelecionado = radio.value;
            }
        });

        if (!algoritmoSelecionado) {
            alert('Por favor, selecione um algoritmo de escalonamento.');
            return;
        }

        // Obter as opções de tempo de chegada e duração
        const tempoChegada = document.querySelector('input[name="ArrivelTime"]:checked')?.value;
        const tempoDuracao = document.querySelector('input[name="DurationTime"]:checked')?.value;

        if (!tempoChegada) {
            alert('Por favor, selecione uma opção para o tempo de chegada.');
            return;
        }

        if (!tempoDuracao) {
            alert('Por favor, selecione uma opção para a duração dos processos.');
            return;
        }

        // Criar o formulário de processos
        criarFormularioProcessos(qtdProcessos, algoritmoSelecionado, tempoChegada, tempoDuracao);
    });
});

/**
 * Cria o formulário de processos com base nas escolhas do usuário
 */
function criarFormularioProcessos(qtdProcessos, algoritmo, tempoChegada, tempoDuracao) {
    // Limpar o conteúdo atual
    const container = document.querySelector('div');
    const header = container.querySelector('header').cloneNode(true);
    container.innerHTML = '';
    container.appendChild(header);

    // Criar seção de formulário de processos
    const section = document.createElement('section');
    section.innerHTML = `<h2>Configuração dos Processos</h2>`;
    
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    
    for (let i = 0; i < qtdProcessos; i++) {
        const processoForm = document.createElement('div');
        processoForm.className = 'processo-form';
        processoForm.innerHTML = `
            <h3>Processo ${i+1}</h3>
            <div class="form-row">
                <label for="processo${i+1}_id">ID:</label>
                <input type="text" id="processo${i+1}_id" value="P${i+1}" readonly>
            </div>
        `;

        // Adicionar campos com base nas opções selecionadas
        if (tempoChegada === 'manual') {
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_chegada">Tempo de Chegada:</label>
                    <input type="number" id="processo${i+1}_chegada" min="0" required>
                </div>
            `;
        } else {
            // Gerar um tempo de chegada aleatório entre 0 e 10
            const tempoAleatorio = Math.floor(Math.random() * 11);
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_chegada">Tempo de Chegada:</label>
                    <input type="number" id="processo${i+1}_chegada" value="${tempoAleatorio}" readonly>
                </div>
            `;
        }

        if (tempoDuracao === 'manual') {
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_duracao">Duração:</label>
                    <input type="number" id="processo${i+1}_duracao" min="1" required>
                </div>
            `;
        } else {
            // Gerar uma duração aleatória entre 1 e 10
            const duracaoAleatoria = Math.floor(Math.random() * 10) + 1;
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_duracao">Duração:</label>
                    <input type="number" id="processo${i+1}_duracao" value="${duracaoAleatoria}" readonly>
                </div>
            `;
        }

        // Adicionar campo de prioridade se o algoritmo for PRIORIDADE
        if (algoritmo === 'PRIORIDADE') {
            const prioridadeAleatoria = Math.floor(Math.random() * 5) + 1;
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_prioridade">Prioridade:</label>
                    <input type="number" id="processo${i+1}_prioridade" min="1" max="5" value="${prioridadeAleatoria}" ${tempoDuracao === 'aleatorio' ? 'readonly' : ''}>
                    <span class="help-text">(1: Alta, 5: Baixa)</span>
                </div>
            `;
        }
        
        // Adicionar campo de bilhetes se o algoritmo for LOTERIA
        if (algoritmo === 'LOTERIA') {
            const bilhetesAleatorios = Math.floor(Math.random() * 5) + 1;
            processoForm.innerHTML += `
                <div class="form-row">
                    <label for="processo${i+1}_bilhetes">Bilhetes:</label>
                    <input type="number" id="processo${i+1}_bilhetes" min="1" value="${bilhetesAleatorios}" ${tempoDuracao === 'aleatorio' ? 'readonly' : ''}>
                    <span class="help-text">(Quanto mais bilhetes, maior a chance de ser selecionado)</span>
                </div>
            `;
        }

        formContainer.appendChild(processoForm);
    }

    section.appendChild(formContainer);

    // Adicionar campo quantum se for Round Robin ou Loteria
    if (algoritmo === 'RR' || algoritmo === 'LOTERIA') {
        const quantumDiv = document.createElement('div');
        quantumDiv.className = 'quantum-section';
        quantumDiv.innerHTML = `
            <h3>Configuração do ${algoritmo === 'RR' ? 'Round Robin' : 'Escalonamento por Loteria'}</h3>
            <div class="form-row">
                <label for="quantum">Quantum:</label>
                <input type="number" id="quantum" min="1" value="2" required>
            </div>
        `;
        section.appendChild(quantumDiv);
    }

    // Adicionar botões
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons-container';
    buttonsDiv.innerHTML = `
        <button id="btnVoltar">Voltar</button>
        <button id="btnSimular">Simular Execução</button>
    `;
    section.appendChild(buttonsDiv);

    container.appendChild(section);

    // Adicionar evento ao botão voltar
    document.getElementById('btnVoltar').addEventListener('click', function() {
        window.location.reload();
    });

    // Adicionar evento ao botão simular
    // Adicionar esta função ao script.js
    function validarProcessos(processos, algoritmo) {
        // Verificar se há processos
        if (!processos || processos.length === 0) {
            return { valido: false, mensagem: 'Nenhum processo foi definido.' };
        }
        
        // Verificar campos obrigatórios
        for (let i = 0; i < processos.length; i++) {
            const p = processos[i];
            
            if (p.chegada === undefined || p.duracao === undefined) {
                return { 
                    valido: false, 
                    mensagem: `Processo ${p.id} tem campos incompletos.` 
                };
            }
            
            if (p.duracao <= 0) {
                return { 
                    valido: false, 
                    mensagem: `Processo ${p.id} tem duração inválida. A duração deve ser maior que zero.` 
                };
            }
            
            if (algoritmo === 'PRIORIDADE') {
                if (p.prioridade === undefined) {
                    return { 
                        valido: false, 
                        mensagem: `Processo ${p.id} não tem prioridade definida.` 
                    };
                }
            }
            
            if (algoritmo === 'LOTERIA') {
                if (p.bilhetes === undefined) {
                    return { 
                        valido: false, 
                        mensagem: `Processo ${p.id} não tem bilhetes definidos.` 
                    };
                }
            }
        }
        
        return { valido: true };
    }
    document.getElementById('btnSimular').addEventListener('click', function() {
        // Coletar os dados dos processos
        const processos = [];
        for (let i = 0; i < qtdProcessos; i++) {
            const processo = {
                id: document.getElementById(`processo${i+1}_id`).value,
                chegada: parseInt(document.getElementById(`processo${i+1}_chegada`).value),
                duracao: parseInt(document.getElementById(`processo${i+1}_duracao`).value)
            };

            // Adicionar prioridade se aplicável
            if (algoritmo === 'PRIORIDADE') {
                processo.prioridade = parseInt(document.getElementById(`processo${i+1}_prioridade`).value);
            }
            
            // Adicionar bilhetes se aplicável
            if (algoritmo === 'LOTERIA') {
                processo.bilhetes = parseInt(document.getElementById(`processo${i+1}_bilhetes`).value);
            }

            processos.push(processo);
        }

        // Obter quantum se for Round Robin ou Loteria
        let quantum;
        if (algoritmo === 'RR' || algoritmo === 'LOTERIA') {
            quantum = parseInt(document.getElementById('quantum').value);
        }

        // Salvar os dados no localStorage
        localStorage.setItem('processos', JSON.stringify(processos));
        localStorage.setItem('algoritmo', algoritmo);
        if (quantum) {
            localStorage.setItem('quantum', quantum);
        }

        // Redirecionar para a página de visualização
        window.location.href = 'html/grafico.html';
    });
}

/**
 * Cria a visualização da execução dos processos
 */
function criarVisualizacaoExecucao(processos, algoritmo, quantum) {
    // Limpar o conteúdo atual
    const container = document.querySelector('div');
    const header = container.querySelector('header').cloneNode(true);
    container.innerHTML = '';
    container.appendChild(header);

    // Criar seção para a visualização
    const section = document.createElement('section');
    section.className = 'visualizacao-section';
    section.innerHTML = `
        <h2>Simulação de Execução - ${getAlgoritmoNome(algoritmo)}</h2>
        <div class="info-container">
            <p>Total de Processos: ${processos.length}</p>
            ${(algoritmo === 'RR' || algoritmo === 'LOTERIA') ? `<p>Quantum: ${quantum}</p>` : ''}
        </div>
    `;

    // Criar tabela de processos
    const tabelaProcessos = document.createElement('div');
    tabelaProcessos.className = 'tabela-processos';
    tabelaProcessos.innerHTML = `
        <h3>Processos</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Chegada</th>
                    <th>Duração</th>
                    ${algoritmo === 'PRIORIDADE' ? '<th>Prioridade</th>' : ''}
                    ${algoritmo === 'LOTERIA' ? '<th>Bilhetes</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${processos.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.chegada}</td>
                        <td>${p.duracao}</td>
                        ${algoritmo === 'PRIORIDADE' ? `<td>${p.prioridade}</td>` : ''}
                        ${algoritmo === 'LOTERIA' ? `<td>${p.bilhetes}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    section.appendChild(tabelaProcessos);

    // Criar área para a visualização gráfica
    // (Esta parte será implementada com os algoritmos específicos)
    const graficoContainer = document.createElement('div');
    graficoContainer.className = 'grafico-container';
    graficoContainer.innerHTML = `
        <h3>Visualização da Execução</h3>
        <div id="graficoExecucao" class="grafico">
            <!-- Aqui será renderizado o gráfico de Gantt -->
            <p>Implementação do gráfico de Gantt pendente.</p>
        </div>
    `;
    section.appendChild(graficoContainer);

    // Adicionar área para métricas
    const metricasContainer = document.createElement('div');
    metricasContainer.className = 'metricas-container';
    metricasContainer.innerHTML = `
        <h3>Métricas</h3>
        <div id="metricas" class="metricas">
            <!-- Aqui serão exibidas as métricas -->
            <p>As métricas serão calculadas após a implementação dos algoritmos.</p>
        </div>
    `;
    section.appendChild(metricasContainer);

    // Adicionar botão para voltar
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons-container';
    buttonsDiv.innerHTML = `
        <button id="btnVoltarConfig">Voltar para Configuração</button>
        <button id="btnNovaSimulacao">Nova Simulação</button>
    `;
    section.appendChild(buttonsDiv);

    container.appendChild(section);

    // Adicionar eventos aos botões
    document.getElementById('btnVoltarConfig').addEventListener('click', function() {
        // Voltar para a tela de configuração mantendo os dados
        const qtdProcessos = processos.length;
        const tempoChegada = 'manual'; // Assume que queremos editar manualmente
        const tempoDuracao = 'manual'; // Assume que queremos editar manualmente
        criarFormularioProcessos(qtdProcessos, algoritmo, tempoChegada, tempoDuracao);
        
        // Preencher os formulários com os dados atuais
        setTimeout(() => {
            processos.forEach((p, i) => {
                document.getElementById(`processo${i+1}_chegada`).value = p.chegada;
                document.getElementById(`processo${i+1}_duracao`).value = p.duracao;
                if (algoritmo === 'PRIORIDADE') {
                    document.getElementById(`processo${i+1}_prioridade`).value = p.prioridade;
                }
                if (algoritmo === 'LOTERIA') {
                    document.getElementById(`processo${i+1}_bilhetes`).value = p.bilhetes;
                }
            });
            
            if (algoritmo === 'RR' || algoritmo === 'LOTERIA') {
                document.getElementById('quantum').value = quantum;
            }
        }, 100);
    });

    document.getElementById('btnNovaSimulacao').addEventListener('click', function() {
        window.location.reload();
    });
}

/**
 * Retorna o nome completo do algoritmo com base no valor
 */
function getAlgoritmoNome(algoritmo) {
    const nomes = {
        'RR': 'Round Robin',
        'FCFS': 'First Come First Serve',
        'SJF': 'Shortest Job First',
        'SRTF': 'Shortest Remaining Time First',
        'PRIORIDADE': 'Prioridade',
        'LOTERIA': 'Escalonamento por Loteria'
    };
    return nomes[algoritmo] || algoritmo;
}

/**
 * Função auxiliar para salvar o quantum
 */
function salvanumber(){
  const quantun = document.getElementById('qua').value;
}
