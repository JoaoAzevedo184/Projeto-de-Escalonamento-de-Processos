/**
 * 
 */


document.addEventListener('DOMContentLoaded', function() {
    const algoritmos = {
        'RR': 'O Round Robin é um algoritmo de escalonamento que define um intervalo de tempo fixo para cada processo, chamado quantum. Cada processo recebe um quantum de tempo para executar e, se não terminar, volta para o final da fila.',
        
        'FCFS': 'First Come First Serve (FCFS) é o algoritmo mais simples, onde os processos são executados na ordem em que chegam, sem interrupção. O primeiro processo a chegar é o primeiro a ser executado completamente.',
        
        'SJF': 'Shortest Job First (SJF) prioriza a execução do processo com menor tempo de execução. É um algoritmo não preemptivo que pode causar starvation em processos longos.',
        
        'SRTF': 'Shortest Remaining Time First (SRTF) é a versão preemptiva do SJF. O processo em execução pode ser interrompido se chegar um novo processo com tempo de execução menor que o tempo restante do processo atual.',
        
        'PRIORIDADE': 'O escalonamento por Prioridade executa os processos de acordo com um valor de prioridade atribuído. Quanto menor o número, maior a prioridade. Pode usar preempção quando um processo de maior prioridade chega.',
        
        'MULTIPROCESSO': 'O Multiprocessamento com Prioridade permite a execução simultânea de processos em múltiplos processadores, considerando a prioridade de cada processo na alocação dos recursos.'
    };

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
});
function salvanumber(){
  const quantun = document.getElementById('qua').value;
}