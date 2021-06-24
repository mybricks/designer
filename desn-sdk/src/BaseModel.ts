/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {uuid} from './utils';

export default class BaseModel {
  id;

  constructor() {
    if (!this.id) {
      try {
        this.id = uuid();
      } catch (ex) {//this.id maybe has no setter
        if (!(ex instanceof TypeError)) {
          throw ex;
        }
      }
    }
  }
}


