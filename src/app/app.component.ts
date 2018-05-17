import { Component, ViewChild, ElementRef } from '@angular/core';

import { AppService } from '../serve/http';
import * as $ from 'jquery';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'app';
  headText = 'Music ➢ ';
  @ViewChild('input') input: ElementRef;
  @ViewChild('head') head: ElementRef;
  @ViewChild('history') history: ElementRef;
  @ViewChild('foot') foot: ElementRef;


  constructor(private service: AppService) {

  }

  onKey(event) {
    if (event.keyCode === 13) {
      this.enter();
    }
  }
  enter() {
    const elementRef = this.input.nativeElement;
    this.foot.nativeElement.style.visibility = 'hidden';
    // console.log(this.trim(elementRef.value));
    const current = elementRef.value.replace(/\s/g, '&nbsp;');
    $(this.history.nativeElement).append(`<p>${this.headText + current}</p>`);

    setTimeout(() => {
      $(this.history.nativeElement).append(this.service.input(elementRef.value));
      setTimeout(() => {
        elementRef.value = '';
        this.foot.nativeElement.style.visibility = 'visible';
        $(elementRef).focus();
      }, 400);
    }, 500);
  }

}
