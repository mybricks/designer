import {Serializable} from '@mybricks/rxui'

import {SerializeNS} from '../../constants';
import GeoViewModel from "../GeoViewModel";
import SlotModel from "../SlotModel";

@Serializable(SerializeNS + 'geo.DialogViewModel')
export default class DialogViewModel extends GeoViewModel {
  btns: []

  constructor(from:SlotModel) {
    super()
    if (from) {
      this.id = from.id
      this.title = from.title

      this.style.width = 600
      this.style.height = 500
    }
  }
}
