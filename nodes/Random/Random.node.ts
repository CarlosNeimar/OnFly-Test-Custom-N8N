import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class RandomNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Random',
		name: 'random',
		icon: 'file:RandomIcon.svg',
		group: ['Random'],
		version: 1,
		description: 'Gerador de números aleatórios OnFly',
		defaults: {
			name: 'Random Number Generator',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
            {
                displayName: 'Número Mínimo',
                name: 'minNumber',
                type: 'number',
                default: 0,
                placeholder: '0',
                description: 'O valor mínimo para o número aleatório',
								required: true,
            },
            {
                displayName: 'Número Máximo',
                name: 'maxNumber',
                type: 'number',
                default: 100,
                placeholder: '100',
                description: 'O valor máximo para o número aleatório',
								required: true,
            },
        ],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: INodeExecutionData[] = [];
    const items = this.getInputData();

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const min = this.getNodeParameter('minNumber', itemIndex, 0) as number;
        const max = this.getNodeParameter('maxNumber', itemIndex, 100) as number;

        const response = await this.helpers.request({
          uri: `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`,
          method: 'GET',
          json: false,
        });

        const newItem: INodeExecutionData = {
          json: JSON.parse(JSON.stringify(items[itemIndex].json)),
          pairedItem: {
            item: itemIndex,
          },
        };

        newItem.json.randomNumber = parseInt(response as string, 10);

        returnData.push(newItem);

      } catch (error) {
        if (this.continueOnFail()) {
          const newItem = {
            json: {
              ...items[itemIndex].json,
              error: error.message
            },
            pairedItem: {
              item: itemIndex
            },
          };
          returnData.push(newItem);
          continue;
        }
        throw error;
      }
    }
    return [returnData];
  }
}
