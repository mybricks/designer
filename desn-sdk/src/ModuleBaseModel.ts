import ComSeedModel from "./ComSeedModel";

export default class ModuleBaseModel extends ComSeedModel {
  slot
  frame

  constructor(model, opts?: { slot, frame }) {
    super(model)
    if (opts) {
      this.slot = opts.slot
      this.frame = opts.frame
    }
  }
}