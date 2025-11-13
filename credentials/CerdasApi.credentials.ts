import type {
    IAuthenticate,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class CerdasApi implements ICredentialType {

    name = 'CerdasApi';
    displayName = 'Cerdas API';
    documentationUrl = 'cerdas';

    properties: INodeProperties[] = [
        {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'string',
            typeOptions: { password: true },
            default: '',
        },
    ];

    // // 0. Query Parameters Authentication
    // authenticate: IAuthenticate = {
    //     type: 'generic',
    //     properties: {
    //         qs: {
    //             appid: '={{$credentials.accessToken}}',
    //         },
    //     },
    // };

    // 1. Header Authentication
    authenticate: IAuthenticate = {
        type: 'generic',
        properties: {
            headers: {
                'Authorization': '=Bearer {{$credentials.accessToken}}',
            },
        },
    };

    // // 2. Body Authentication
    // authenticate: IAuthenticate = {
    //     type: 'generic',
    //     properties: {
    //         body: {
    //             'api_key': '={{$credentials.accessToken}}',
    //         },
    //     },
    // };

    // // 3. Multiple Parameters
    // authenticate: IAuthenticate = {
    //     type: 'generic',
    //     properties: {
    //         qs: {
    //             'api_key': '={{$credentials.apiKey}}',
    //             'user_id': '={{$credentials.userId}}',
    //         },
    //     },
    // };
    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://pln-dashboard-insight.inergi.id',
            url: '/',
        },
    };
}