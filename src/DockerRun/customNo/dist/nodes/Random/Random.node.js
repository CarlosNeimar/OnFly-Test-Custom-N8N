"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
class Random {
    constructor() {
        this.description = {
            displayName: 'Random',
            name: 'random',
            icon: 'file:RandomIcon.svg',
            group: ['Random'],
            version: 1,
            description: 'Gerador de números aleatórios OnFly',
            defaults: {
                name: 'Random Number Generator',
            },
            inputs: ["main"],
            outputs: ["main"],
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
    }
    async execute() {
        const returnData = [];
        const items = this.getInputData();
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const min = this.getNodeParameter('minNumber', itemIndex, 0);
                const max = this.getNodeParameter('maxNumber', itemIndex, 100);
                const response = await this.helpers.request({
                    uri: `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`,
                    method: 'GET',
                    json: false,
                });
                const newItem = {
                    json: JSON.parse(JSON.stringify(items[itemIndex].json)),
                    pairedItem: {
                        item: itemIndex,
                    },
                };
                newItem.json.randomNumber = parseInt(response, 10);
                returnData.push(newItem);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const newItem = {
                        json: {
                            ...items[itemIndex].json,
                            error: error.message,
                        },
                        pairedItem: {
                            item: itemIndex,
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
exports.Random = Random;
//# sourceMappingURL=Random.node.js.map