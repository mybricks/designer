/**
 * Topological view
 *
 *
 * @author: CheMingjun(chemingjun@126.com)
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
