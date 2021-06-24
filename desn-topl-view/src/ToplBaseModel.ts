/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import FrameModel from './frame/FrameModel';

import {BaseUIModel} from '@sdk';

export default abstract class ToplBaseModel extends BaseUIModel {
  //parent: ToplComModel | FrameModel

  parent

  zIndex: number = 0;

  forkedFrom

  isParentAFrame() {
    return parent && parent.parent
  }

  getRoot(stopFn?: (now) => boolean): FrameModel {
    let rtn = this;
    while (rtn.parent) {
      rtn = rtn.parent as any;
      if (typeof stopFn === 'function' && stopFn(rtn)) {
        break
      }
    }

    return rtn as FrameModel;
  }

  focus(some?) {
    this.state.focus();
  }

  blur() {
    if (!this.state.isDisabled()) {
      this.state.blur();
    }
    this.state.runningRecover()
  }
}
