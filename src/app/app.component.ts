import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from '../serve/http';
import * as $ from 'jquery';
import '../assets/js/jquery.terminal.min';
import { Print, print, Color } from '../serve/print';
import { getCurrentDate } from '../serve/defer';
import { format, LRC } from '../serve/format-factory';

declare let document: any;
interface SongSheet {
  name: string;
  id: string | number;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {

  private index = 0;
  private src = '';
  private lrc: LRC[] = [];


  private playInfo: SongSheet = null;
  private searchList = [];
  private playList: SongSheet[] = [];

  private loop = false;

  private resize = '';
  private version = '10.0.16299.231';

  @ViewChild('terminal') terminalEle: ElementRef;
  private $terminal: any;
  private terminal: any;
  private $audio: any;

  constructor(private service: AppService) {

  }

  lyric(res) {
    let data: any = [];
    let arr;
    let str;
    try {
      str = res.lrc.lyric;
      arr = str.split('\n');
      arr.forEach(v => {
        const lyro = format.lyric(v);
        if (lyro) {
          data.push(lyro);
        }
      });
      this.lrc = data;
    } catch (e) {
      print.error('解析歌词失败');
      data = false;
    }
    return data;
  }

  url(res) {

    let url;
    try {
      url = res.data[0].url;
    } catch (e) {
      print.error('播放失败，请检查资源是否存在，请重试。。。');
    }
    return url;

  }

  download(id) {
    const a = document.createElement('a');
    this.service.play(id).subscribe(res => {
      const url = this.url(res);
      if (url) {
        a.href = url;
        a.style.display = 'none';
        a.download = url;
        document.querySelector('body').append(a);
        a.click();
        a.remove();
      }
    });
  }


  test() {
    const a = this.$audio.val();
    console.log(a);
  }


  ngOnDestroy() {
    this.terminal.destroy();
  }

  ngOnInit() {
    this.playList = this.service.getPlayList() as any || [];
    this.$terminal = $(this.terminalEle.nativeElement);
    this.initCmd();
    this.onResize();
    this.$audio = $('#app-audio');
    this.$audio.on('timeupdate', () => {
      this.playLyrics();
    });
    this.$audio.on('ended', () => {
      if (this.loop) {
        this.musicPlay();
      } else {
        this.next();
      }
    });

  }


  next() {

  }

  miao(str) {
    const arr = str.split(':');
    return Number(arr[0]) * 60 + (Number(arr[1]));
  }


  pushPlsyList(data: SongSheet) {
    this.playList.push(data);
    this.service.savePlayList(this.playList);
  }

  removeMusic(id) {

    if (id === 'all') {
      this.playList = [];
      this.service.savePlayList([]);
      return;
    }

    for (let i = 0; i < this.playList.length; i++) {

      if (this.playList[i].id === id || this.playList[i].id === Number(id)) {
        this.playList.splice(i, 1);
        this.service.savePlayList(this.playList);
        break;
      }
    }

  }

  setCurrent(v) {
    this.playInfo = {
      name: v.name,
      id: v.id
    };
  }



  addList(id) {


    // 已有列表
    for (let i = 0; i < this.playList.length; i++) {

      const v = this.playList[i];
      if (v.id === id) {
        this.setCurrent(v);
        return;
      }
    }


    // 已有搜索列表
    for (let i = 0; i < this.searchList.length; i++) {

      const v = this.searchList[i];
      if (v.id === id) {
        const name = v.name + '-' + v.artists[0].name;
        const info = {
          name: name,
          id: v.id
        };
        this.setCurrent(info);
        this.pushPlsyList(info);
        return;
      }
    }

    // 在线获取
    this.service.detail(id).subscribe((res: any) => {
      let name = '';
      try {
        name = res.songs[0].name + '-' + res.songs[0].ar[0].name;
      } catch (e) {
        name = '未知歌名';
      }

      const info = {
        name,
        id
      };
      this.pushPlsyList(info);

      this.setCurrent(info);

    });

  }

  playLyrics() {

    const currentTime = this.$audio[0].currentTime;

    if (this.lrc.length && this.lrc[1] && currentTime > this.miao(this.lrc[1].time)) {
      const text = this.lrc[1].text;
      print.setLyrics(text);
      this.lrc.shift();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.$terminal.height($(window).height() - 15);
  }

  volume(n) {
    const num = Number(n);
    if (typeof num === 'number' && num >= 0 && num <= 1) {
      this.$audio[0].volume = num;
      print.success(print.progress(n * 10, 10));
    } else {
      print.error('Input Error： 控制音量失败，请输入0.0 到 1.0的数字');
    }
  }

  updateLyrics() {
    print.removeLyrics();
    print.displayLyrics();
    print.setLyrics('');
  }

  play(id) {
    this.cliStop();
    const promise = [
      this.service.play(id).toPromise(),
      this.service.lyric(id).toPromise(),
    ];

    Promise.all(promise).then((arr: any[]) => {
      this.lyric(arr[1]);
      const num = new Date().getTime() + '';

      const url = this.url(arr[0]);
      if (url) {
        print.stopLoading();
        this.$audio.attr('src', url);
        this.musicPlay(false);
        print.success('资源加载正常，播放中。。。');
        setTimeout(() => {
          this.addList(id);
          this.updateLyrics();
          this.cliStart();
        }, 1000);
      } else {
        print.error('歌曲暂无版权，不能正常播放');
        this.cliStart();
      }
    }).catch(e => {
      print.error('播放失败，请检查资源是否存在，请重试。。。');
      this.cliStart();
    });
  }

  cliStop() {
    this.terminal.pause();
  }
  cliStart() {
    this.terminal.resume();
  }

  search(name) {
    const start = new Date().getTime();
    this.cliStop();
    this.service.search(name).subscribe((res: any) => {

      const resobj = format.list(res);
      if (resobj.text) {
        this.searchList = resobj.array;
        print.normal(resobj.text);
        print.success('Request：successfully.');
      } else {
        print.error('找不到资源');
      }
      print.normal('Time：' + (new Date().getTime() - start) + 'ms');
      this.cliStart();

    });
  }
  musicStop() {
    this.$audio[0].pause();
    print.success('暂停');
  }
  musicPlay(log = true) {
    this.$audio[0].play();
    if (log) {
      print.success('播放');
    }
  }
  initCmd() {
    const terminal = this.terminal = this.$terminal.terminal({
      add: (a, b) => {
        print.normal(a + b);
      },
      // foo: 'foo.php',
      test: () => {
        this.test();
      },
      state: () => {
        const audio = this.$audio[0];
        const state = {
          crossOrigin: audio.crossOrigin,
          muted: audio.muted,
          played: audio.played,
          currentTime: audio.currentTime,
          duration: audio.duration,
          networkState: audio.networkState,
          error: audio.error,
          version: this.version,
          playInfo: this.playInfo ? (this.playInfo.name + this.playInfo.id) : '无',
          playbackRate: audio.playbackRate,
          volume: audio.volume,
          paused: audio.paused,
          onLine: navigator.onLine ? '在线' : print.SPAN('网络连接失败', Color.error),
          time: getCurrentDate()
        };
        print.state(state);
      },
      volume: n => {
        this.volume(n);
      },
      remove: id => {
        this.removeMusic(id);
      },
      list: () => {
        const list = this.service.getPlayList();
        print.list(list, this.playInfo ? this.playInfo.id : false);
      },
      search: name => {
        this.search(name);
      },
      lyrics: () => {
        this.updateLyrics();
      },
      download: id => {
        this.download(id);
      },
      help: () => {
        const text = format.help();
        print.normal(text);
      },
      play: id => {
        this.play(id);
      },
      stop: () => {
        this.musicStop();
      },
      start: () => {
        this.musicPlay();
      },
      bar: {
        sub: (a, b) => {
          print.normal(a - b);
        }
      }
    }, {
        greetings: `[版本 ${this.version}] (c) 2018 Music Corporation。保留所有权利。`,
        name: 'music app',
        width: '100%',
        prompt: 'music>',
        softPause: true,
        keydown: (e) => {
          // console.log(terminal);
          // const keyboard = e.originalEvent;
          // if (keyboard.ctrlKey && keyboard.keyCode === 67) {
          //   this.cliStart();
          // }
        },
        onClear: () => {
          print.removeLyrics();
          this.onResize();
          terminal.resize();
        }
      });

    print.init(terminal);

  }
}
