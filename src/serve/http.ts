import { Injectable } from '@angular/core';
import { script, ResponseBody } from './script';
import { Message } from './command';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class AppService {
    private message = new Message();
    constructor(private http: HttpClient) {

    }
    trim(str) {
        const arr = str.split(' ');
        const newarr = [];
        arr.forEach(v => {
            if (v !== '') {
                newarr.push(v);
            }
        });
        return newarr.join(' ');
    }
    output(str) {
        return '';
    }
    resolve(res?) {
        return Promise.resolve(res);
    }
    async httpService(http, keyword: string) {
        const request = await this.http.get(http + keyword).toPromise();
        return request;
    }
    showResponse(response, str) {

        return this.httpService(response.http, str).then((request: any) => {
            const content = [];
            request.result.songs.forEach((v, i) => {
                content.push(`${i + 1}：<i>id：</i>${v.id} <i> ,name：</i>${v.name}<br/>`);
            });
            return this.message.info(content.join(' '), response.color);
        });

    }

    input(str): Promise<any> {
        const command = this.trim(str);
        const response: ResponseBody = script[command];

        if (!response) {
            return this.resolve(this.message.nocommand(str));
        }

        if (response.script) {
            return this.resolve(response);
        } else if (response.http) {
            return this.resolve(this.showResponse(response, '海阔天空'));
        } else if (response.content) {
            return this.resolve(this.message.info(response.content, response.color));
        }
        return this.resolve();
    }
}
