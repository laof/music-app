import { Defer, guid, secondToDate } from './tool';
import { SongSheet } from '../app/app.component';
import * as $ from 'jquery';

export let Color = {
    success: '#23d18b',
    error: '#ff0000',
    normal: '#aaa',
    purple: '#ac3fea', // 紫色
    mud: '#ce9178', // 泥巴色
    warn: '#f5f543',
};


interface CssName {
    name: string;
    loading: string;
    duration: string;
    singer: string;
    time: string;
    progress: string;
    lyrics: string;
}



export class Print {

    private screen: Boolean = false;

    private id = 'a' + new Date().getTime();

    private L: string;
    private R: string;

    private loader = 0;

    // private $load = null;
    // private $loadi = null;
    // private $name = null;
    // private $singer = null;
    // private $time = null;
    // private $lyrics = null;
    // private $duration = null;

    private terminal: any;
    private LRegExp: RegExp;
    private RRegExp: RegExp;
    private css: CssName;
    private oldLyric: String = '...';
    private oldTime: String = '00:00:00';



    constructor() {
        this.L = guid();
        this.R = guid();
        this.LRegExp = new RegExp(this.L, 'g');
        this.RRegExp = new RegExp(this.R, 'g');

        this.css = {
            name: 'name' + this.id,
            loading: 'loading' + this.id,
            singer: 'singer' + this.id,
            time: 'time' + this.id,
            lyrics: 'lyrics' + this.id,
            progress: 'progress' + this.id,
            duration: 'duration' + this.id
        };

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
    html(content) {
        const str = content.replace(this.LRegExp, '<');
        const text = str.replace(this.RRegExp, '>');
        return text;
    }
    unhtml(html) {
        const str = html.replace(/</g, this.L);
        const text = str.replace(/>/g, this.R);
        return text;
    }
    log(text): Promise<any> {
        const defer = new Defer();
        this.terminal.echo(text, {
            raw: true,
            finalize: (dom) => {
                const str = this.html(dom.html());
                dom.html(str);
                defer.resolve(dom);
            }
        });
        return defer.promise;
    }


    destroyScreen() {
        // this.$name = null;
        // this.$singer = null;
        // this.$time = null;
        // this.$lyrics = null;
        this.updateCss();
        this.screen = false;
    }

    drawProgress(buffered, duration) {

        const dom = $('#' + this.css.loading);
        const load = ['\\', '|', '-', '/'];
        let str = '...';
        let pr = '';
        const finish = false;
        if (!dom.length) {
            return;
        }

        this.loader++;
        if (this.loader >= load.length) {
            this.loader = 0;
        }

        const width = dom.width();
        const height = dom.height();

        for (let i = 0; i < buffered.length; i++) {
            const leadingEdge = buffered.start(i) / duration * width;
            const trailingEdge = buffered.end(i) / duration * width;
            const n = (trailingEdge - leadingEdge) / width;
            if (n) {
                if (n < 1) {
                    pr = load[this.loader];
                } else {
                    pr = 'ok';
                }
                const temp = (trailingEdge - leadingEdge) / width * 100;
                str = temp.toFixed(2) + '%';
            }
            dom.html('[' + pr + ']' + str);
        }
    }

    updateCss() {
        Object.keys(this.css).forEach(key => {
            $('#' + this.css[key]).removeAttr('id');
        });
    }

    createScreen(info): Promise<any> {

        if (this.screen) {
            return Promise.resolve();
        }

        const defer = new Defer();

        const css = this.css;

        const html = `
            <span id="${css.loading}" style="color:#5a5a59;">load...</span>
            <span id="${css.name}" style="color:${Color.success};">${info.name}</span>
            <span id="${css.singer}" >${info.singer}</span>
            <span style="color:${Color.mud};" >[</span>
            <span id="${css.time}" style="color:${Color.mud};"  >${this.oldTime}</span>
            <span>/</span>
            <span id="${css.duration}" style="color:${Color.mud};" >${info.time}</span>
            <span style="color:${Color.mud};" >]</span>
            <span style="color:${Color.purple};"> ∲ </span>
            <span id="${css.lyrics}" style="color:${Color.purple};" >${this.oldLyric}</span>
        `;


        this.log(this.unhtml(html)).then(dom => {
            this.screen = true;
            defer.resolve();
        });
        return defer.promise;
    }

    private value(id, value) {

        const target = document.getElementById(id);
        if (target) {
            target.innerHTML = value;
        }

    }

    musicInfo(info) {
        this.value(this.css.name, info.name);
        this.value(this.css.singer, info.singer);
        this.value(this.css.duration, info.time);
        this.value(this.css.lyrics, info.lyrics);
    }
    time(timer) {
        const time = secondToDate(timer);
        this.oldTime = time;
        this.value(this.css.time, time);
    }

    lyrics(text) {
        const str = text || '...';
        this.oldLyric = str;
        this.value(this.css.lyrics, str);
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
