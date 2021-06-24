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


