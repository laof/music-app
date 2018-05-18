import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import config from '../config';
@Injectable()
export class AppService {
    private host = config.server;
    constructor(private http: HttpClient) {

    }

    httpGet(keyword: string) {
        return this.http.get(this.host + '/search?keywords=' + keyword);
    }
    play(id) {
        return this.http.get(this.host + '/music/url?id=' + id);
    }
    httpPost(api, { }) {
        return this.http.post(this.host + api, {}).subscribe(res => res);
    }

    input(str): Promise<any> {

        return Promise.resolve('res');
    }
}
