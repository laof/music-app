import { Defer, guid } from './defer';


export let Color = {
    success: '#23d18b',
    error: '#ff0000',
    normal: '#aaa',
    purple: '#ac3fea', // 紫色
    warn: '#f5f543',
};

export let loadingText = [

    ''

];


export class Print {

    private loading = false;
    private id = 'a' + new Date().getTime();
    private lyricsDom;
    private lyr: Boolean = false;

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

    private target(tag, content, color = Color.normal) {
        return `${this.L}${tag} style='color:${color};' ${this.R} ${content} ${this.L}/${tag}${this.R}`;
    }


    list(list, playId) {
        const aa = this.target('table', this.target('tr', this.target('td', 'xxxx')));
        const tr = [];
        for (let i = 0; i < list.length; i += 2) {
            const v = list[i];
            const v1 = list[i + 1];
            const ix = i + 1;
            const nest = (v1 ? this.target('td', '&nbsp;&nbsp;&nbsp;' + (ix + 1) + '、' + v1.name + ' ID：' + v1.id, v1.id === playId ? Color.warn : Color.normal) : '');
            const td = this.target('td', ix + '、' + v.name + ' ID：' + v.id, v.id === playId ? Color.warn : Color.normal) + nest;
            tr.push(this.target('tr', td));
        }
        this.success(this.target('table', tr.join('')));
    }

    state(state) {
        const aa = this.target('table', this.target('tr', this.target('td', 'xxxx')));
        const tr = [];
        Object.keys(state).forEach(key => {
            const td = this.target('td', key) + this.target('td', state[key], Color.success);
            tr.push(this.target('tr', td));
        });

        this.success(this.target('table', tr.join('')));
    }

    progress(current: number, max: number = 100) {

        const finish = new Array(current).fill('♪');

        let content = '';


        if (current >= max) {
            content = finish.join('');
        } else {
            const count = new Array(max - current).fill('&nbsp;');
            content = finish.join('') + this.SPAN(count.join(''), Color.normal);
        }

        return '[' + this.SPAN(content, Color.warn) + ']' + this.SPAN(Number(((current / max) * 100).toFixed(2)) + '%', Color.normal);


    }

    starLoading() {
        this.log(this.SPAN(Color.warn, Color.normal)).then(dom => {

        });
    }
    stopLoading() {

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

    removeLyrics() {
        this.lyr = false;
        if (this.lyricsDom) {
            this.lyricsDom.html('....').removeClass('lyrics' + this.id);
        }
        this.lyricsDom = null;
    }

    displayLyrics() {
        this.lyr = true;
    }

    setLyrics(str) {

        if (!this.lyr) {
            return;
        }

        str = '♬' + (str || '.....');

        if (this.lyricsDom) {
            this.lyricsDom.html(str);
        } else {
            this.log(str).then(dom => {
                if (this.lyr) {
                    this.lyricsDom = dom.addClass('lyrics' + this.id).html(str);
                }
            });
        }
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
