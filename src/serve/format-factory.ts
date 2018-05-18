import { Print, print, Color } from './print';
import { getCurrentDate } from './defer';


export class FormatFactory {

    lyric(text) {

        const doc = {
            time: null,
            text: null
        };
        let leftindex = -1;
        let rightindex = -1;
        let success = false;
        for (let i = 0; i < text.length; i++) {

            const _s = text.charAt(i);

            if (_s === '[' && rightindex === -1) {
                leftindex = i;
            } else if (leftindex !== -1 && _s === ']') {
                rightindex = i;
            }

            if (leftindex !== -1 && rightindex !== -1) {
                success = true;
                doc.time = text.substring(leftindex + 1, rightindex);
                doc.text = text.substring(rightindex + 1, text.length);
                break;
            }
        }

        if (success) {
            return doc;
        } else {
            console.error(text);
        }
    }

    help() {
        const item = [];
        item.push(print.P('➢ exit * 回退上一步骤', Color.normal));
        item.push(print.P('➢ clear * 回退上一步骤', Color.normal));
        item.push(print.P('➢ play 345 * 选取id为345播放', Color.normal));
        item.push(print.P('➢ stop * 暂停', Color.normal));
        item.push(print.P('➢ start * 播放', Color.normal));
        item.push(print.P('➢ search 关键字 * 搜索音乐/音乐人/专辑', Color.normal));
        return item.join('');
    }

    list(res) {
        const message = [];

        print.normal('Date: ' + getCurrentDate());
        const attr = [
            'name', 'id', 'artists', 'alias', 'duration', 'status', 'fee', 'album'
        ];
        res.result.songs.forEach((v, i) => {
            const item = [];
            item.push(print.SPAN(i + 1, Color.warn));
            item.push(print.SPAN(`: ${v.name} ，`, Color.success));
            item.push(print.SPAN(` [id] : ${v.id} ，`, Color.success));
            item.push(print.SPAN(` [演唱] : ${v.artists[0].name} ，`, Color.normal));
            item.push(print.SPAN(` [电台] : 《${v.album.name}》 ，`, Color.normal));
            item.push(print.SPAN(` (alias) : ${v.alias} ，`, Color.error));
            item.push(print.SPAN(` [时长] : ${(v.duration / (1000 * 60)).toFixed(2)} ，`, Color.purple));
            item.push(print.SPAN(` [status] : ${v.status} ，`, Color.normal));
            item.push(print.SPAN(` fee : ${v.fee} ，`, Color.normal));
            item.push(print.BR());
            message.push(item.join(''));
        });

        return message.join('');

    }

}
export let format = new FormatFactory();
