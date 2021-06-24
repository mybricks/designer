import {GeoComModel} from './GeoComModel';

export default class GeoComDebugModel extends GeoComModel {
  // _id
  //
  // constructor(id) {
  //   super()
  //   this._id = id
  // }

  // get id() {
  //   return this._id
  // }

  inputParams: { [index: string]: any }

  inputs: { [index: string]: any }

  outputs: { [index: string]: (data) => any }

  frames: { [index: string]: (data, key?) => any }
}
