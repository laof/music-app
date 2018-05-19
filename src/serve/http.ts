import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import config from '../config';
import { Api } from './api';
import { Print, print, Color } from '../serve/print';
@Injectable()
export class AppService {


    private storageKey = 'ngAppService';

    private host = config.server;
    constructor(private http: HttpClient) {

    }


    private storage(key, obj?) {
        if (obj) {
            return localStorage.setItem(key, JSON.stringify(obj));
        } else {
            return JSON.parse(localStorage.getItem(key));
        }
    }


    savePlayList(obj) {
        this.storage(this.storageKey, obj);
    }

    getPlayList() {
        return this.storage(this.storageKey);
    }


    start(url) {
        const all = this.host + url;
        print.normal(print.SPAN('Loading  LHttpRequest ：', Color.purple) + encodeURI(all));
        return all;
    }

    detail(id) {
        return this.get(Api.detail + id);
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
