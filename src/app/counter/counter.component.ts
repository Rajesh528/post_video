import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import { EventEmitter, Input, Output} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {first, map} from 'rxjs/operators';
import { interval, merge, NEVER, combineLatest, BehaviorSubject } from 'rxjs';
import { mapTo, scan, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import {ElementIds} from '../element-ids.enum';
import{CounterState} from '../counter-state.interface'
export type Command =
  { isTicking: boolean } |
  { count: number } |
  { countUp: boolean } |
  { tickSpeed: number } |
  { countDiff: number };  
@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls:['./counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent  implements OnInit{
  elementIds = ElementIds;
  initialCounterState: CounterState = {
    isTicking: false,
    count: 0,
    countUp: true,
    tickSpeed: 200,
    countDiff: 1
  };
  btnStart: Subject<Event> = new Subject<Event>();
  btnPause: Subject<Event> = new Subject<Event>();
  btnSetTo: Subject<Event> = new Subject<Event>();
  btnReset: Subject<Event> = new Subject<Event>();
  inputSetTo: Subject<Event> = new Subject<Event>();
  tickSpeed: Subject<number> = new Subject<number>();
  countMove = new BehaviorSubject<boolean>(true);
  countDiff = new BehaviorSubject<number>(this.initialCounterState.countDiff);
  state$: Observable<number>;

ngOnInit(){

}
constructor() {
    const interval$ = this.tickSpeed.pipe(
      startWith(this.initialCounterState.tickSpeed),
      switchMap(value => interval(value))
    );

    const btnStart$ = this.btnStart.pipe(
      mapTo(true)
    );
    const btnPause$ = this.btnPause.pipe(
      mapTo(false)
    );
    const play$ = merge(btnStart$, btnPause$).pipe(
      switchMap(value => !value ? NEVER : interval$) 
    );

    const btnSetTo$ = this.btnSetTo.pipe(
      withLatestFrom(this.inputSetTo, (_, values) => +values),
      startWith(0)
    );
    const btnReset$ = this.btnReset.pipe(
      mapTo(0)
    );
    this.state$ = merge(btnSetTo$, btnReset$).pipe(
      switchMap(value => play$.pipe(
        scan(acc => this.counterFn(acc), value),
        startWith(value)
      ))
    );

  }
  getInputValue = (event: HTMLInputElement): number => {
    return event['target'].value ? parseInt(event['target'].value) : null
  }

  counterFn = (value: number) => {
    const countDiff = this.countDiff.value;
    return this.countMove.value ? (value + countDiff) : (value - countDiff);
  }

}
