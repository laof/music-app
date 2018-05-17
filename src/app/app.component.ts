import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AppService } from '../serve/http';
import { Step } from '../serve/step';
import * as $ from 'jquery';

declare let document: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  title = 'app';
  headText = 'Music ➢ ';
  @ViewChild('input') input: ElementRef;
  @ViewChild('head') head: ElementRef;
  @ViewChild('history') history: ElementRef;
  @ViewChild('foot') foot: ElementRef;

  private step: Step = new Step();
  private $input: any;
  private $history: any;

  constructor(private service: AppService) {

    document.onkeydown = (e) => {

      const isFocus = this.$input.is(':focus');
      if (!isFocus) {
        this.$input.focus();
      }

      if (e.code === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
        return false;
      }
      return true;
    };
  }

  ngOnInit() {
    this.$input = $(this.input.nativeElement);
    this.$history = $(this.history.nativeElement);
    this.$input.focus();
  }

  moveEnd() {
    const obj = this.input.nativeElement;
    const len = obj.value.length;
    if (document.selection) {
      const sel = obj.createTextRange();
      sel.moveStart('character', len);
      sel.collapse();
      sel.select();
    } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      obj.selectionStart = obj.selectionEnd = len;
    }
  }

  select(value) {
    if (value) {
      this.input.nativeElement.value = value;
    }
    this.moveEnd();
  }

  onKey(event) {

    switch (event.keyCode) {
      case 13:
        this.enter();
        break;
      case 38:

        this.select(this.step.goBack());
        break;
      case 40:

        this.select(this.step.goTo());
        break;
    }
  }

  delNewline(str) {
    const newstr = str + '';
    return newstr.substring(0, newstr.length - 1);
  }
  clear() {
    this.$history.empty();
  }
  hideInput() {
    this.foot.nativeElement.style.visibility = 'hidden';
  }
  showInput() {
    this.foot.nativeElement.style.visibility = 'visible';
    this.$input.focus().val('');
  }
  enter() {
    const elementRef = this.input.nativeElement;
    const value = elementRef.value;
    if (value === '') {
      elementRef.value = '';
      this.select(false);
      return;
    }
    this.step.add(value);
    this.hideInput();
    const current = value.replace(/\s/g, '&nbsp;'); // 保持输入 输出一致
    this.$history.append(`<p>${this.headText + current}</p>`);

    setTimeout(() => {
      const promise: Promise<any> = this.service.input(value);

      promise.then(res => {
        this.showResponse(res);
      }).catch(error => error);

    }, 300);
  }
  showResponse(response) {
    if (response && typeof response === 'object') {
      const res = this[response.key];
      if (res) {
        res();
      } else {
        console.log(response.result.songs);
      }
      this.showInput();
      return;
    }
    this.$history.append(response);
    setTimeout(() => {
      this.input.nativeElement.value = '';
      this.showInput();
      this.$input.focus();
    }, 200);
  }

}
