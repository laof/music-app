import { Defer, guid } from './defer';


export let Color = {
    success: '#23d18b',
    error: '#ff0000',
    normal: '#aaa',
    purple: '#ac3fea', // 紫色
    warn: '#f5f543',
};

export class Print {

    private L: string;
    private R: string;

    private terminal: any;
    private LRegExp: RegExp;
    private RRegExp: RegExp;

    constructor() {
        this.L = guid();
        this.R = guid();
        this.LRegExp = new RegExp(this.L, 'g');
        this.RRegExp = new RegExp(this.R, 'g');
    }

    private target(tag, content, color) {
        return `${this.L}${tag} style='color:${color};' ${this.R} ${content} ${this.L}/${tag}${this.R}`;
    }
    init(terminal) {
        this.terminal = terminal;
    }
    SPAN(content, color) {
        return this.target('span', content, color);
    }
    P(content, color) {
        return this.target('p', content, color);
    }
    BR() {
        return `${this.L}br/${this.R}`;
    }
    log(text): Promise<any> {
        const defer = new Defer();
        this.terminal.echo(text, {
            raw: true,
            finalize: (dom) => {
                const str1 = text.replace(this.LRegExp, '<');
                const str = str1.replace(this.RRegExp, '>');
                dom.html(str);
                defer.resolve(dom);
            }
        });
        return defer.promise;
    }
    warn(text) {
        return this.log(this.SPAN(text, Color.warn));
    }
    normal(text) {
        return this.log(this.SPAN(text, Color.normal));
    }
    success(text) {
        return this.log(this.SPAN(text, Color.success));
    }
    error(text) {
        return this.log(this.SPAN(text, Color.error));
    }
}


export let print = new Print();
