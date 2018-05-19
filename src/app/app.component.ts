import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from '../serve/http';
import * as $ from 'jquery';
import '../assets/js/jquery.terminal.min';
import { Print, print, Color } from '../serve/print';
import { getCurrentDate, Defer } from '../serve/defer';
import { format, LRC } from '../serve/format-factory';
import { CATCH_ERROR_VAR } from '@angular/compiler/src/output/abstract_emitter';

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

  private loop: String = 'no';

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
    this.loop = this.service.loop() || this.loop;
    this.playInfo = this.service.playInfo() as any;
    this.$terminal = $(this.terminalEle.nativeElement);
    this.initCmd();
    this.onResize();
    this.$audio = $('#app-audio');
    this.$audio.on('timeupdate', () => {
      this.playLyrics();
    });
    this.$audio.on('ended', () => {
      if (this.loop === 'yes') {
        this.musicPlay();
      } else {
        this.next();
      }
    });

  }


  next(next = true) {

    if (!this.playList || !this.playList.length) {
      return;
    }
    const id = this.playInfo ? this.playInfo.id : '';

    if (id) {
      for (let i = 0; i < this.playList.length; i++) {
        const v = this.playList[i];
        if (id === v.id) {
          const nestObj = this.playList[(next ? (i + 1) : (i - 1))];
          if (nestObj) {
            this.play(nestObj.id);
          } else {
            if (next) {
              this.play(this.playList[0].id);
            } else {
              this.play(this.playList[this.playList.length - 1].id);
            }
          }
        }
      }
    } else {
      this.playInfo = this.playList[0];
      this.play(this.playInfo.id);
    }

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
      this.playInfo = null;
      this.$audio[0].src = '';
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

  setCurrent(id) {

    for (let i = 0; i < this.playList.length; i++) {

      const v = this.playList[i];
      if (v.id === id) {
        this.playInfo = {
          name: v.name,
          id: v.id
        };
        this.service.playInfo(this.playInfo);
        return;
      }
    }

  }



  addList(id) {

    const defer = new Defer();

    // 已有列表
    for (let i = 0; i < this.playList.length; i++) {

      const v = this.playList[i];
      if (v.id === id) {
        defer.resolve(false);
        return defer.promise;
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
        this.pushPlsyList(info);
        defer.resolve(true);
        return defer.promise;
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

      if (res.songs.length) {
        this.pushPlsyList(info);
        defer.resolve(true);
      } else {
        defer.reject('获取歌单信息失败，请检查' + id + '是否存在！');
      }
    });
    return defer.promise;

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
        this.musicPlay();
        print.success('资源加载正常，播放中。。。');
        setTimeout(() => {
          this.addList(id).then(res => {
            this.setCurrent(id);
            print.success('当前播放：' + this.playInfo.name + '-ID：' + this.playInfo.id);
          });
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



  showList() {
    const list = this.service.getPlayList() || [];
    if (!list.length) {
      print.warn('播放列表空');
    } else {
      print.list(list, this.playInfo ? this.playInfo.id : false);
    }
  }
  musicStop() {
    this.$audio[0].pause();
    print.success('暂停');
  }
  musicPlay(log = false) {

    const src = this.$audio[0].src;

    if (src && src.indexOf(location.href) === -1) {
      try {
        this.$audio[0].play();
        if (log) {
          print.success('播放');
        }
      } catch (e) {
        print.error('资源解析错误，播放失败');
      }

    } else if (this.playInfo && this.playInfo.id) {
      this.play(this.playInfo.id);
    } else {
      print.warn('没有资源，请查看播放列表');
    }

  }
  initCmd() {
    const terminal = this.terminal = this.$terminal.terminal({
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
          loop: this.loop,
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
      add: (id) => {
        this.cliStop();
        this.addList(id).then(res => {
          if (res) {
            print.success('添加成功');
            this.showList();
          } else {
            print.error('添加失败，列表已存在');
          }
          this.cliStart();
        }).catch(res => {
          print.error(res);
          this.cliStart();
        });
      },
      delete: id => {
        this.removeMusic(id);
        this.showList();
      },
      loop: (flag) => {

        switch (flag) {
          case 'show':
            print.normal(this.loop);
            break;
          case 'yes':
          case 'no':
            this.loop = flag;
            this.service.loop(flag);
            break;
        }
      },
      version: () => {
        print.normal(this.version);
      },
      list: () => {
        this.showList();
      },
      search: name => {
        this.search(name);
      },
      lyrics: () => {
        this.updateLyrics();
      },
      next: () => {
        this.next();
      },
      prev: () => {
        this.next(false);
      },
      download: id => {
        // print.warn('浏览器不支持');
        this.download(id);
      },
      help: () => {
        const text = format.help();
        print.normal(text);
      },
      play: id => {
        if (id === 'all') {
          if (this.searchList.length) {
            const list = [];
            this.searchList.forEach(v => {
              list.push({
                name: v.name,
                id: v.id
              });
            });
            this.playList = list;
            this.service.savePlayList(list);
            this.playInfo = null;
            this.showList();
            this.next();
          } else {
            print.warn('没有相关列表,请先执行search 命令');

          }
        } else {
          this.play(id);
        }
      },
      stop: () => {
        this.musicStop();
      },
      start: () => {
        this.musicPlay(true);
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
