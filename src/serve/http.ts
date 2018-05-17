import { Injectable } from '@angular/core';
import { script } from './script';
import { Message } from './command';
@Injectable()
export class AppService {
    private message = new Message();
    trim(str) {
        const arr = (str.substring(0, str.length - 1) + '').split(' ');
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
    input(str) {
        const command = this.trim(str);
        let response = script[command];
        if (response && typeof response === 'object') {
            return response;
        } else if (response) {
            response = this.message.success(response);
        } else {
            response = this.message.nocommand(str);
        }
        return response;
    }
}
