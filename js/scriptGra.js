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
            
            // Definir algoritmo de escalonamento baseado no valor do localStorage
            let resultadoExecucao;
            
            // Aqui você executaria o algoritmo selecionado
            // Por enquanto, vamos usar um resultado de exemplo
            resultadoExecucao = simularExecucao(processos, algoritmo, quantum);
            
            // Renderizar o gráfico de Gantt com o resultado da execução
            renderizarGrafico(resultadoExecucao);
            
            // Calcular e exibir métricas
            calcularMetricas(resultadoExecucao);
            
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
        
        // Função para simular a execução (exemplo)
        function simularExecucao(processos, algoritmo, quantum) {
            // Esta é uma simulação simples para exemplo
            // Os algoritmos reais seriam importados dos arquivos específicos
            
            // Para FCFS (exemplo simples)
            if (algoritmo === 'FCFS') {
                return simularFCFS(processos);
            } 
            // Para Round Robin (exemplo simples)
            else if (algoritmo === 'RR') {
                return simularRR(processos, parseInt(quantum));
            }
            // Para os outros algoritmos, faremos implementações básicas para exemplo
            else {
                // Retornar um resultado genérico para teste
                return gerarResultadoExemplo(processos, algoritmo);
            }
        }
        
        // Simulação básica de FCFS para exemplo
        function simularFCFS(processos) {
            // Ordenar processos por tempo de chegada
            const processosCopia = [...processos].sort((a, b) => a.chegada - b.chegada);
            
            let tempoAtual = 0;
            const resultado = {
                algoritmo: 'FCFS',
                tempoTotal: 0,
                execucao: [],
                metricas: {
                    tempoEspera: [],
                    tempoRetorno: [],
                    tempoTurnaround: []
                }
            };
            
            // Para cada processo
            processosCopia.forEach(processo => {
                // Se o tempo atual é menor que o tempo de chegada, avança o tempo
                if (tempoAtual < processo.chegada) {
                    tempoAtual = processo.chegada;
                }
                
                // Calcula tempo de espera
                const tempoEspera = tempoAtual - processo.chegada;
                resultado.metricas.tempoEspera.push({
                    processo: processo.id,
                    valor: tempoEspera
                });
                
                // Adiciona a execução ao resultado
                resultado.execucao.push({
                    processo: processo.id,
                    inicio: tempoAtual,
                    fim: tempoAtual + processo.duracao
                });
                
                // Avança o tempo atual
                tempoAtual += processo.duracao;
                
                // Calcula tempo de retorno (turnaround)
                const tempoRetorno = tempoAtual - processo.chegada;
                resultado.metricas.tempoRetorno.push({
                    processo: processo.id,
                    valor: tempoRetorno
                });
            });
            
            resultado.tempoTotal = tempoAtual;
            return resultado;
        }
        
        // Simulação básica de Round Robin para exemplo
        function simularRR(processos, quantum) {
            const processosCopia = [...processos].map(p => ({...p, tempoRestante: p.duracao}));
            const resultado = {
                algoritmo: 'RR',
                tempoTotal: 0,
                execucao: [],
                metricas: {
                    tempoEspera: [],
                    tempoRetorno: []
                }
            };
            
            let tempoAtual = 0;
            let fila = [];
            let processosRestantes = processosCopia.length;
            
            // Enquanto houver processos não concluídos
            while (processosRestantes > 0) {
                // Verificar novos processos que chegaram
                processosCopia.forEach(p => {
                    if (p.chegada <= tempoAtual && p.tempoRestante > 0 && !fila.includes(p)) {
                        fila.push(p);
                    }
                });
                
                // Se não há processos na fila, avança o tempo
                if (fila.length === 0) {
                    tempoAtual++;
                    continue;
                }
                
                // Pega o próximo processo da fila
                const processoAtual = fila.shift();
                
                // Determina quanto tempo esse processo vai executar neste ciclo
                const tempoExecucao = Math.min(quantum, processoAtual.tempoRestante);
                
                // Adiciona essa execução ao resultado
                resultado.execucao.push({
                    processo: processoAtual.id,
                    inicio: tempoAtual,
                    fim: tempoAtual + tempoExecucao
                });
                
                // Atualiza o tempo restante e o tempo atual
                processoAtual.tempoRestante -= tempoExecucao;
                tempoAtual += tempoExecucao;
                
                // Verificar novamente se há novos processos que chegaram durante essa execução
                processosCopia.forEach(p => {
                    if (p.chegada <= tempoAtual && p.tempoRestante > 0 && !fila.includes(p) && p !== processoAtual) {
                        fila.push(p);
                    }
                });
                
                // Se o processo ainda não terminou, coloca de volta na fila
                if (processoAtual.tempoRestante > 0) {
                    fila.push(processoAtual);
                } else {
                    // Processo concluído, calcular métricas
                    processosRestantes--;
                    
                    // Calcular tempo de retorno (turnaround)
                    const tempoRetorno = tempoAtual - processoAtual.chegada;
                    resultado.metricas.tempoRetorno.push({
                        processo: processoAtual.id,
                        valor: tempoRetorno
                    });
                    
                    // Calcular tempo de espera (turnaround - duração)
                    const tempoEspera = tempoRetorno - processoAtual.duracao;
                    resultado.metricas.tempoEspera.push({
                        processo: processoAtual.id,
                        valor: tempoEspera
                    });
                }
            }
            
            resultado.tempoTotal = tempoAtual;
            return resultado;
        }
        
        // Função para gerar um resultado de exemplo para outros algoritmos
        function gerarResultadoExemplo(processos, algoritmo) {
            // Cria um resultado de exemplo genérico para visualização
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
        
        // Renderiza o gráfico de Gantt
        function renderizarGrafico(resultado) {
            const ganttChart = document.getElementById('gantt-chart');
            const timeIndicators = document.getElementById('time-indicators');
            
            // Limpar conteúdo anterior
            ganttChart.innerHTML = '';
            timeIndicators.innerHTML = '';
            
            // Obter a lista de processos únicos
            const processosIds = [...new Set(resultado.execucao.map(item => item.processo))];
            
            // Criar indicadores de tempo
            const tempoTotal = resultado.tempoTotal;
            const escala = 40; // 40px por unidade de tempo
            
            // Adicionar marcadores de tempo
            for (let i = 0; i <= tempoTotal; i++) {
                const timeMark = document.createElement('div');
                timeMark.className = 'time-mark';
                timeMark.style.width = escala + 'px';
                timeMark.textContent = i;
                timeIndicators.appendChild(timeMark);
            }
            
            // Criar linhas para cada processo
            processosIds.forEach(processoId => {
                const processRow = document.createElement('div');
                processRow.className = 'process-row';
                
                // Label do processo
                const processLabel = document.createElement('div');
                processLabel.className = 'process-label';
                processLabel.textContent = processoId;
                processRow.appendChild(processLabel);
                
                // Timeline do processo
                const timeline = document.createElement('div');
                timeline.className = 'timeline';
                timeline.style.width = (tempoTotal * escala) + 'px';
                
                // Adicionar linhas verticais para marcar o tempo
                for (let i = 0; i <= tempoTotal; i++) {
                    const timeLine = document.createElement('div');
                    timeLine.className = 'time-line';
                    timeLine.style.left = (i * escala) + 'px';
                    timeline.appendChild(timeLine);
                }
                
                processRow.appendChild(timeline);
                
                // Adicionar blocos de execução para este processo
                const execucoesProcesso = resultado.execucao.filter(item => item.processo === processoId);
                
                execucoesProcesso.forEach(execucao => {
                    const processBlock = document.createElement('div');
                    processBlock.className = 'process-block';
                    processBlock.style.left = (execucao.inicio * escala) + 'px';
                    processBlock.style.width = ((execucao.fim - execucao.inicio) * escala) + 'px';
                    processBlock.textContent = `${execucao.inicio}-${execucao.fim}`;
                    timeline.appendChild(processBlock);
                });
                
                ganttChart.appendChild(processRow);
            });
        }
        
        // Calcula e exibe métricas de desempenho
        function calcularMetricas(resultado) {
            // Tempo médio de espera
            const tempoEsperaMedio = resultado.metricas.tempoEspera.reduce((acc, item) => acc + item.valor, 0) / resultado.metricas.tempoEspera.length;
            document.getElementById('tempo-espera').textContent = tempoEsperaMedio.toFixed(2);
            
            // Tempo médio de retorno
            const tempoRetornoMedio = resultado.metricas.tempoRetorno.reduce((acc, item) => acc + item.valor, 0) / resultado.metricas.tempoRetorno.length;
            document.getElementById('tempo-retorno').textContent = tempoRetornoMedio.toFixed(2);
            
            // Throughput (processos / tempo total)
            const throughput = resultado.metricas.tempoRetorno.length / resultado.tempoTotal;
            document.getElementById('throughput').textContent = throughput.toFixed(3);
            
            // Utilização da CPU (tempo de CPU / tempo total)
            const tempoCPU = resultado.execucao.reduce((acc, item) => acc + (item.fim - item.inicio), 0);
            const utilizacaoCPU = (tempoCPU / resultado.tempoTotal) * 100;
            document.getElementById('utilizacao-cpu').textContent = utilizacaoCPU.toFixed(1) + '%';
        }