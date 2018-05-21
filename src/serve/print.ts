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
    singer: string;
    time: string;
    lyrics: string;
}



export class Print {

    private screen: Boolean = false;

    private id = 'a' + new Date().getTime();

    private L: string;
    private R: string;

    private $name = null;
    private $singer = null;
    private $time = null;
    private $lyrics = null;
    private $duration = null;

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
        this.$name = null;
        this.$singer = null;
        this.$time = null;
        this.$lyrics = null;
        this.screen = false;
    }

    createScreen(info): Promise<any> {

        if (this.screen) {
            return Promise.resolve();
        }

        const defer = new Defer();
        const css = {
            name: 'name' + this.id,
            singer: 'singer' + this.id,
            time: 'time' + this.id,
            lyrics: 'lyrics' + this.id,
            duration: 'duration' + this.id
        };

        const html = `
            <span class="${css.name}" style="color:${Color.success};">${info.name}</span>
            <span class="${css.singer}" >${info.singer}</span>
            <span style="color:${Color.mud};" >[</span>
            <span class="${css.time}" style="color:${Color.mud};"  >${this.oldTime}</span>
            <span>/</span>
            <span class="${css.duration}" style="color:${Color.mud};" >${info.time}</span>
            <span style="color:${Color.mud};" >]</span>
            <span style="color:${Color.purple};"> ∲ </span>
            <span class="${css.lyrics}" style="color:${Color.purple};" >${this.oldLyric}</span>
        `;

        this.log(this.unhtml(html)).then(dom => {
            this.$name = dom.find('.' + css.name);
            this.$singer = dom.find('.' + css.singer);
            this.$time = dom.find('.' + css.time);
            this.$duration = dom.find('.' + css.duration);
            this.$lyrics = dom.find('.' + css.lyrics);
            this.screen = true;
            defer.resolve();
        });
        return defer.promise;
    }

    musicInfo(info) {
        this.$name.html(info.name);
        this.$singer.html(info.singer);
        this.$duration.html(info.time);
        this.$lyrics.html(info.lyrics);
    }
    time(time) {
        this.oldTime = secondToDate(time);
        if (this.$time) {
            this.$time.html(this.oldTime);
        }
    }

    lyrics(text) {
        const str = text || '...';
        this.oldLyric = str;
        if (this.$lyrics) {
            this.$lyrics.html(str);
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
