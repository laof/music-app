import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import config from '../config';
import { Api } from './api';
import { Print, print, Color } from '../serve/print';
@Injectable()
export class AppService {
    private host = config.server;
    constructor(private http: HttpClient) {

    }

    start(url) {
        const all = this.host + url;
        print.normal(print.SPAN(' Start  LHttpRequest ：', Color.purple) + encodeURI(all));
        return all;
    }

    get(url) {
        return this.http.get(this.start(url));
    }

    post(url, data) {
        return this.http.post(this.start(url), data);
    }
    search(keyword: string) {
        return this.get(Api.search + keyword);
    }
    play(id) {
        return this.get(Api.music + id);
    }

    lyric(id) {
        return this.get(Api.lyric + id);
    }
}
