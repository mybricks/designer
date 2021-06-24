import {Serializable} from "@mybricks/rxui";
import {SerializeNS} from "../constants";
import {PinModel} from "./PinModel";
import {ConModel} from "../con/ConModel";

@Serializable(SerializeNS + 'topl.PinModelForked')
export default class PinModelForked extends PinModel {

  forkedFrom: PinModel

  constructor() {
    super();
    delete this.title
    delete this.schema
    delete this.type
    delete this.direction
    delete this.hostId
  }

  set title(v) {
    this.forkedFrom.title = v
  }

  get title() {
    return this.forkedFrom.title
  }

  get schema() {
    return this.forkedFrom.schema
  }


  get type() {
    return this.forkedFrom.type
  }

  get direction() {
    return this.forkedFrom.direction
  }

  get hostId() {
    return this.forkedFrom.hostId
  }

  addCon(conModel: ConModel) {
    super.addCon(conModel)
    this.forkedFrom.addCon(conModel)
  }

  deleteCon(conModel: ConModel) {
    super.deleteCon(conModel)
    this.forkedFrom.deleteCon(conModel)
  }
}