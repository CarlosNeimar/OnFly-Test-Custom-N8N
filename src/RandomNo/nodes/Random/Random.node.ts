// Importa os tipos e classes necessários do pacote n8n-workflow
import type {
  IExecuteFunctions,    // Interface para as funções de execução disponíveis no n
  INodeExecutionData,   // Interface para os dados que fluem entre os nós
  INodeType,            // Interface que define a estrutura de um nó customizado
  INodeTypeDescription, // Interface para a descrição do nó que aparece na UI do n8n
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; // Enum para tipos de conexão (entrada/saída)

// Declara a classe do nó, que deve implementar a interface INodeType
export class RandomNode implements INodeType {
  // 'description' contém todas as informações que o n8n usa para renderizar o nó na interface
  description: INodeTypeDescription = {
    displayName: 'Random', // Nome de exibição do nó na UI
    name: 'random', // Nome técnico/interno do nó
    icon: 'file:RandomIcon.svg', // Ícone do nó
    group: ['Random'], // Grupo em que o nó aparecerá na paleta de nós
    version: 1, // Versionamento do nó
    description: 'Gerador de números aleatórios OnFly', // Descrição do que o nó faz
    defaults: {
      name: 'Random Number Generator', // Nome padrão que o nó recebe ao ser arrastado para o workflow
    },
    inputs: [NodeConnectionType.Main], // Define que o nó aceita uma entrada principal
    outputs: [NodeConnectionType.Main], // Define que o nó possui uma saída principal
    usableAsTool: true, // Permite que este nó seja usado por um Agente de IA
    // 'properties' define os campos de configuração que aparecerão no painel de parâmetros do nó
    properties: [
      {
        displayName: 'Número Mínimo', // Rótulo do campo na UI
        name: 'minNumber', // Nome da propriedade para acessá-la no código
        type: 'number', // Tipo do campo número
        default: 0, // Valor padrão do campo
        placeholder: '0', // Texto de exemplo exibido no campo vazio
        description: 'O valor mínimo para o número aleatório', // Texto de ajuda para o usuário
        required: true, // Torna o preenchimento deste campo obrigatório
      },
      {
        displayName: 'Número Máximo', // Rótulo do campo na UI
        name: 'maxNumber', // Nome da propriedade para acessá-la no código
        type: 'number', // Tipo do campo
        default: 100, // Valor padrão do campo
        placeholder: '100', // Texto de exemplo exibido no campo vazio
        description: 'O valor máximo para o número aleatório', // Texto de ajuda
        required: true, // Torna o preenchimento deste campo obrigatório
      },
    ],
  };

  // O método 'execute' é função do nó
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Cria um array para armazenar os itens de dados que serão retornados ao final da execução
    const returnData: INodeExecutionData[] = [];
    // Obtém os dados de entrada do nó anterior. Pode ser um ou mais itens
    const items = this.getInputData();

    // Inicia um loop para processar cada item de entrada individualmente
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        // Obtém o valor do parâmetro 'minNumber' para o item atual. Se não for definido, usa 0 como padrão
        const min = this.getNodeParameter('minNumber', itemIndex, 0) as number;
        // Obtém o valor do parâmetro 'maxNumber' para o item atual. Se não for definido, usa 100 como padrão
        const max = this.getNodeParameter('maxNumber', itemIndex, 100) as number;

        // Usa o 'request helper' do n8n para fazer uma requisição HTTP para a API do random.org
        const response = await this.helpers.request({
          uri: `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`,
          method: 'GET', // Define o método HTTP como GET
          json: false, // Resposta não é um JSON, é um texto
        });

        // Cria um novo objeto de dados para o item de saída, clonando o JSON do item de entrada
        const newItem: INodeExecutionData = {
          json: JSON.parse(JSON.stringify(items[itemIndex].json)), // Garante uma cópia profunda dos dados
          pairedItem: { // Mantém o rastreamento do item de entrada correspondente
            item: itemIndex,
          },
        };

        // Converte a resposta (string) para um número inteiro e a adiciona ao JSON do novo item
        newItem.json.randomNumber = parseInt(response as string, 10);

        // Adiciona o item recém-processado ao array de dados de retorno
        returnData.push(newItem);

      } catch (error) {
        // Bloco 'catch' para tratamento de erros que possam ocorrer no 'try'
        // Verifica se a opção "Continue on Fail" está habilitada nas configurações do nó
        if (this.continueOnFail()) {
          // Se estiver, cria um item de saída com a mensagem de erro
          const newItem = {
            json: {
              ...items[itemIndex].json, // Mantém os dados originais
              error: error.message, // Adiciona uma chave 'error' com a descrição do erro
            },
            pairedItem: {
              item: itemIndex,
            },
          };
          // Adiciona o item com erro aos dados de retorno
          returnData.push(newItem);
          // Pula para a próxima iteração do loop, continuando a execução
          continue;
        }
        // Se "Continue on Fail" não estiver habilitado, lança o erro, interrompendo o workflow
        throw error;
      }
    }
    // Retorna os dados processados encapsulados em um array. É o formato esperado pelo n8n
    return [returnData];
  }
}
