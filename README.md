# 📌 Simulador de Escalonamento de Processos

Este projeto implementa um simulador interativo de diferentes algoritmos de escalonamento de processos, permitindo a visualização e comparação do comportamento de cada método através de uma interface gráfica moderna com efeito glass morphism.

## 📂 Estrutura do Projeto

```
processo-escalonamento/
│─── assets/
│    └── img/               # Imagens utilizadas no projeto
│─── css/
│    ├── style.css         # Estilos da interface principal
│    └── grafico.css       # Estilos específicos para gráficos
│─── js/
│    ├── script.js         # Lógica principal do simulador
│    ├── scriptGra.js      # Lógica para geração de gráficos
│    └── algoritmos/       # Implementações dos algoritmos
│         ├── roundRobin.js
│         ├── Loteria.js
│         ├── fcfs.js
│         ├── sjf.js
│         ├── srtf.js
│         └── prioridade.js
│─── index.html           # Interface do usuário
│─── grafico.html        # Página de visualização dos gráficos
└─── README.md           # Documentação
```

## ⚙️ Funcionalidades

### Algoritmos Implementados
- **Round Robin (RR)**: Escalonamento com quantum de tempo fixo
- **First Come First Serve (FCFS)**: Primeiro a chegar, primeiro a ser executado
- **Shortest Job First (SJF)**: Prioriza processos mais curtos
- **Shortest Remaining Time First (SRTF)**: Versão preemptiva do SJF
- **Prioridade**: Escalonamento baseado em prioridades
- **Loteria**: Escalonamento probabilístico com sistema de bilhetes

### Características do Sistema
- Interface intuitiva com efeito glass morphism
- Seleção do tipo de escalonamento com explicações detalhadas
- Definição flexível da quantidade de processos (1-20)
- Opções de tempo de chegada (aleatório/manual)
- Configuração da duração dos processos
- Visualização em tempo real da execução
- Gráfico de Gantt interativo
- Métricas de desempenho detalhadas

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estruturação semântica da interface
- **CSS3** - Estilização moderna com glass morphism
- **JavaScript** - Implementação dos algoritmos e interatividade
- **Git** - Controle de versão e colaboração

## 🎯 Conceitos Abordados

- Escalonamento de Processos
- Algoritmos de Escalonamento
- Gerenciamento de Processos
- Design de Interface com Glass Morphism
- Manipulação do DOM
- Programação Orientada a Eventos
- Visualização de Dados com Gráficos
- Métricas de Desempenho

## 📊 Métricas Analisadas

- Tempo médio de espera
- Tempo médio de retorno
- Tempo médio de resposta
- Throughput

## 🚀 Como Executar

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/processo-escalonamento.git
```

2. Navegue até o diretório do projeto:
```bash
cd processo-escalonamento
```

3. Abra o arquivo `index.html` em um navegador web moderno

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Reportar bugs
2. Sugerir novas funcionalidades
3. Enviar pull requests