import { Print, print, Color } from './print';
import { getCurrentDate } from './defer';

export interface LRC {
    time: string;
    text: string;
}

export class FormatFactory {

    lyric(text) {

        const doc: LRC = {
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
            return '';
        }
    }

    help() {
        const item = [];
        item.push(print.P(print.SPAN('-- search (Keyword：string)，', Color.warn) + 'Search keywords （搜索关键字）', Color.normal));
        item.push(print.P(print.SPAN('-- play (Number：number | all )，', Color.warn) + 'Select the song to play through ID or All选取id/全部播放）', Color.normal));
        item.push(print.P(print.SPAN('-- volume (Number：number)，', Color.warn) + 'Volume control（音量控制）', Color.normal));
        item.push(print.P(print.SPAN('-- download (Number：number)，', Color.warn) + 'Downloading music suggests using Google high version browsers. Other browsers may cause errors in the music system and use it cautiously.（下载音乐， 建议使用谷歌高版本浏览器，其他浏览器可能会导致音乐系统出错，慎用。）', Color.purple));
        item.push(print.P(print.SPAN('-- loop (yes | no | show)', Color.warn) + 'Set the single cycle to play, the default list is true. （设置单曲循环播放，默认列表循环为true）', Color.normal));
        item.push(print.P(print.SPAN('-- delete (Number：number | all :string)，', Color.warn) + 'Delete one or all of the deletes from the list （从列表中删除某一条或全部删除）', Color.normal));
        item.push(print.P(print.SPAN('-- add (Number：number)，', Color.warn) + 'Add to the playlist （新增到播放列表）', Color.normal));
        item.push(print.P(print.SPAN('-- lyrics，', Color.warn) + 'Show the lyrics of the playback（显示播放的歌词）', Color.normal));
        item.push(print.P(print.SPAN('-- state，', Color.warn) + 'Display the current state（显示当前状态）', Color.normal));
        item.push(print.P(print.SPAN('-- next，', Color.warn) + 'Play the next song（播放下一曲）', Color.normal));
        item.push(print.P(print.SPAN('-- prev，', Color.warn) + 'Play the last song（播放上一曲）', Color.normal));
        item.push(print.P(print.SPAN('-- clear，', Color.warn) + 'Emptying console log（清空控制台）', Color.normal));
        item.push(print.P(print.SPAN('-- exit，', Color.warn) + 'Back level directory（回退上一级目录）', Color.normal));
        item.push(print.P(print.SPAN('-- stop/start，', Color.warn) + 'Pause / play（暂停/播放）', Color.normal));
        return item.join('');
    }

    list(res) {
        const message = [];

        print.normal('Date: ' + getCurrentDate());
        const attr = [
            'name', 'id', 'artists', 'alias', 'duration', 'status', 'fee', 'album'
        ];



        if (!res.result || !res.result.songs || !res.result.songs.length) {
            return {
                text: false,
                array: []
            };
        }

        res.result.songs.forEach((v, i) => {
            const item = [];
            item.push(print.SPAN(i + 1, Color.warn) + ': ');
            item.push(print.SPAN(`${v.name}`, Color.success) + ' ，');
            item.push(print.SPAN(` [id] : ${v.id}`, Color.success) + ' ，');
            item.push(print.SPAN(` {演唱} : ${v.artists[0].name} `, Color.normal) + ' ，');
            item.push(print.SPAN(` [电台] : 《${v.album.name}》`, Color.normal) + ' ，');
            item.push(print.SPAN(` [时长] : ${(v.duration / (1000 * 60)).toFixed(2)}`, Color.purple) + ' ，');
            item.push(print.SPAN(` (alias) : ${v.alias}`, Color.error) + ' ，');
            item.push(print.SPAN(` [status] : ${v.status} `, Color.normal) + ' ，');
            item.push(print.SPAN(` fee : ${v.fee} `, Color.normal) + ' 。');
            item.push(print.BR());
            message.push(item.join(''));
        });

        return {
            text: message.join(''),
            array: res.result.songs
        };

    }

}
export let format = new FormatFactory();
