/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import FrameModel from './FrameModel';

import {I_Runner} from '@mybricks/compiler-js';
import {Ignore, Serializable} from '@mybricks/rxui';
import {SerializeNS, VIEW_TOPL_NAME} from '../constants';

@Serializable(SerializeNS + 'topl.ToplViewModel')
export default class ToplViewModel extends FrameModel {
  name: string = VIEW_TOPL_NAME

  isFrame: boolean = false

  @Ignore
  runner: I_Runner
}