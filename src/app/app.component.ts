import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from '../serve/http';
import * as $ from 'jquery';
import '../assets/js/jquery.terminal.min';
import { Print, print, Color } from '../serve/print';
import { getCurrentDate } from '../serve/defer';
import { format } from '../serve/format-factory';

declare let document: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {

  private resize = '';

  @ViewChild('terminal') terminalEle: ElementRef;
  private $terminal: any;
  private terminal: any;
  private $audio: any;

  constructor(private service: AppService) {

  }


  ngOnDestroy() {
    this.terminal.destroy();
  }

  ngOnInit() {
    this.$terminal = $(this.terminalEle.nativeElement);
    this.initCmd();
    this.onResize();
    this.$audio = $('#app-audio');
  }

  @HostListener('window:resize')
  onResize() {
    this.$terminal.height($(window).height() - 15);
  }

  play(id) {
    this.service.play(id).subscribe((res: any) => {
      const url = res.data[0].url;
      this.$audio.attr('src', url);
    });
  }

  search(name) {
    const start = new Date().getTime();
    print.normal(encodeURI('load: http://www.longhua.online:18080/search?keywords=' + name));
    this.terminal.pause();
    this.service.httpGet(name).subscribe((res: any) => {

      print.normal(format.list(res));
      print.success('Request：successfully.');
      print.normal('Time：' + (new Date().getTime() - start) + 'ms');
      this.terminal.resume();

    });
  }
  initCmd() {
    const terminal = this.terminal = this.$terminal.terminal({
      add: (a, b) => {
        print.normal(a + b);
      },
      foo: 'foo.php',
      search: name => {
        this.search(name);
      },
      help: () => {
        const text = format.help();
        print.normal(text);
      },
      play: id => {
        this.play(id);
      },
      stop: () => {
        this.$audio[0].pause();
      },
      start: () => {
        this.$audio[0].play();
      },
      bar: {
        sub: (a, b) => {
          print.normal(a - b);
        }
      }
    }, {
        greetings: '[版本 10.0.16299.231] (c) 2018 Music Corporation。保留所有权利。',
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
