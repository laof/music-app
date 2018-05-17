export enum MessageColor {
    undefined = '#f14c4c',
    success = '#23d18b',
    normal = 'white'
}

export interface ResponseBody {
    color?: MessageColor;
    content?: string;
    script?: string;
    http?: string;
    key?: string;
}

interface CommandScript {
    [key: string]: ResponseBody;
}

export let script: CommandScript = {
    'version': {
        color: MessageColor.normal,
        content: 'music 1.0.12'
    },
    'play': {
        color: MessageColor.success,
        content: '播放中。。。。'
    },
    'npm run dev': {
        color: MessageColor.success,
        content: '打包编译中，稍等。。。<br/>fdasfsfasdfa fdsaf <br/>fdasf <span id="ddd">aa</span>'
    },
    'cls': {
        script: 'clear',
        key: 'clear'
    },
    'search *': {
        http: 'http://localhost:3000/search?keywords=',
        key: 'webhttp',
        color: MessageColor.success
    }
};
