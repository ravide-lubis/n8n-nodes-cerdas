import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
  IHttpRequestOptions
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Cerdas implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cerdas',
    name: 'Cerdas',
    icon: { light: 'file:cerdas.svg', dark: 'file:cerdas.svg' },
    group: ['input'],
    version: 1,
    description: 'Custom node untuk hit REST API PLN Cerdas',
    defaults: {
      name: 'Cerdas',
    },
    usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'CerdasApi',
        required: true,
      },
    ],
    properties: [
      {
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Current Insight',
						value: 'currentInsight',
						description: 'Returns the current insight data',
						action: 'Return current insight data',
					},
					{
						name: 'Chats Today',
						value: 'chatsToday',
						description: 'Returns the conversation data today',
						action: 'Return conversation data today',
					},
				],
				default: 'currentInsight',
			},
      {
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'http://localhost:8000',
				description: 'base url for get the information from operation.',
			},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('CerdasApi');
    const operation = this.getNodeParameter('operation', 0);
    let url;
    let endpoint = '';

    for (let i = 0; i < items.length; i++) {
      try {
        
        // select endpoint by operation value
        if (operation === 'currentInsight') {
          endpoint = '/dashboard/insight';
        } else if (operation === 'chatsToday') {
          endpoint = '/chat/histories/today';
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `The operation "${operation}" is not known!`,
            { itemIndex: i },
          );
        }
        
        url = this.getNodeParameter('url', i) as string;
        // request process
        const options: IHttpRequestOptions = {
          method: 'GET',
          url: `${url}${endpoint}`,
          json: true,
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
          },
        };

        let responseData;
        try {
					responseData = await this.helpers.httpRequest(options);
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as IDataObject),
          { itemData: { item: i } }
        );
        returnData.push(...executionData);  
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}