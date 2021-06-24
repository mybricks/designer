/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {Ignore, Serializable} from '@mybricks/rxui'

import SlotModel from './SlotModel';

import {SerializeNS, VIEW_GEO_NAME} from '../constants';

@Serializable(SerializeNS + 'geo.GeoViewModel')
export default class GeoViewModel extends SlotModel {
  name: string = VIEW_GEO_NAME

  initF: boolean

  showType: 'pc' | 'mobile'

  @Ignore
  scrollEle: HTMLElement

  @Ignore
  selectZone: { x, y, w, h, models }

  constructor(id?: string, title?: string) {
    super(id, title)
  }
}
