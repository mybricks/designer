import {Serializable} from "@mybricks/rxui";
import {SerializeNS} from "./constants";
import {BaseUIModel} from "@sdk";
import {T_Module} from "./types";

@Serializable(SerializeNS + `StageViewModel`)
export default class StageViewModel extends BaseUIModel {
  designerVersion:number = 0.1

  mainModule: T_Module

  moduleNav: T_Module[] = []

  envVars: {
    envType: string
    userToken: string
    envParams: string
  } = {}

  getCurModule(): T_Module {
    return this.moduleNav.length > 0 ? this.moduleNav[this.moduleNav.length - 1] : void 0
  }

  pushModule(module: T_Module) {
    this.moduleNav.push(module)
  }

  popModule() {
    return this.moduleNav.pop()
  }
}