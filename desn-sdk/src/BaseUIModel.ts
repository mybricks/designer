import {Ignore, recycle, Serializable} from '@mybricks/rxui'
import {uuid} from './utils';
import {SerializeNS} from "./constants";
import BaseModel from "./BaseModel";

@Serializable(SerializeNS + 'ModelState')
export class ModelState {

  @Ignore
  hoverF: boolean = false

  @Ignore
  editingF: boolean = false

  @Ignore
  runningF: boolean = false

  @Ignore
  _fTimeAry: Array<number> = []

  now = 0

  constructor() {
  }

  private pushFocusedTime() {
    this._fTimeAry.push(new Date().getTime())
    if (this._fTimeAry.length > 2) {
      this._fTimeAry.splice(0, this._fTimeAry.length - 2);
    }
  }

  disable() {
    this.now = -1;
  }

  isDisabled(): boolean {
    return this.now == -1;
  }

  static isDisabled(val): boolean {
    return val == -1;
  }

  enable() {
    this.now = 0
    this._fTimeAry = []
    this.editingF = false
    this.runningF = false
  }

  isEnabled(): boolean {
    return this.now == 0;
  }

  static isEnabled(val): boolean {
    return val == 0;
  }

  isEnabledOrAbove(): boolean {
    return this.now >= 0;
  }

  static isEnabledOrAbove(val): boolean {
    return val >= 0;
  }

  hover() {
    this.hoverF = true;
  }

  hoverRecover() {
    this.hoverF = false;
  }

  isHovering(): boolean {
    return this.hoverF;
  }

  editing() {
    this.editingF = true;
  }

  isEditing(): boolean {
    return this.editingF
  }

  editingRecover() {
    this.editingF = false;
  }

  focus() {
    this.now = 2
    this.pushFocusedTime()
  }

  focusedTimeRefresh() {
    this.pushFocusedTime()
  }

  /**
   * 返回focus的时间步长(以此来判断是否为双击等操作）
   */
  get focusedStepTime() {
    let ary = this._fTimeAry, last = ary[ary.length - 1]
    return ary.length >= 2 ? last - ary[ary.length - 2] : last - new Date().getTime()
  }

  isFocused(): boolean {
    return this.now == 2;
  }

  static isFocused(val): boolean {
    return val == 2;
  }

  blur() {
    this.now = 0
    this._fTimeAry = []
    this.editingF = false
  }

  moving() {
    this.now = 3;
  }

  isMoving(): boolean {
    return this.now == 3;
  }

  static isMoving(val): boolean {
    return val == 3;
  }

  resizing() {
    this.now = 4;
  }

  isResizing(): boolean {
    return this.now == 4;
  }

  static isResizing(val): boolean {
    return val == 4;
  }

  running() {
    this.runningF = true
  }

  isRunning(): boolean {
    return this.runningF
  }

  runningRecover() {
    this.runningF = false
  }
}


export default class BaseUIModel extends BaseModel {
  name: string;

  /**
   * State for item
   */
  state: ModelState = new ModelState()

  /**
   * Element for component
   */
  @Ignore
  __el__

  @Ignore
  get $el(): HTMLElement {
    return this.__el__
  }

  set $el(el: HTMLElement | undefined | null) {
    this.__el__ = el
  }

  destroy(): boolean | any {
    debugger
    if (this['__destroied__']) {
      return true
    }
    this['__destroied__'] = true

    recycle(this)
    return false
  }
}


