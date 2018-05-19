import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from '../serve/http';
import * as $ from 'jquery';
import '../assets/js/jquery.terminal.min';
import { Print, print, Color } from '../serve/print';
import { getCurrentDate } from '../serve/defer';
import { format, LRC } from '../serve/format-factory';
declare let document: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {

  private src = '';
  private lrc: LRC[] = [];

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
        data.push(format.lyric(v));
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
    this.$terminal = $(this.terminalEle.nativeElement);
    this.initCmd();
    this.onResize();
    this.$audio = $('#app-audio');
    this.$audio.on('timeupdate', () => {
      this.playLyrics();
    });
  }

  playLyrics() {
    if (this.$audio.currentTime > this.lrc[1].time) {
      const text = this.lrc[1].text;
      console.log(text);
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
          this.cliStart();
        }, 1000);
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

      print.normal(format.list(res));
      print.success('Request：successfully.');
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
          playbackRate: audio.playbackRate,
          volume: audio.volume,
          paused: audio.paused
        };
        print.state(state);
      },
      volume: n => {
        this.volume(n);
      },
      search: name => {
        this.search(name);
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
        greetings: `[版本 this.version] (c) 2018 Music Corporation。保留所有权利。`,
        name: 'music app',
        width: '100%',
        prompt: 'music>',
        softPause: true,
        onClear: () => {
          this.onResize();
          terminal.resize();
        }
      });

    print.init(terminal);

  }
}
