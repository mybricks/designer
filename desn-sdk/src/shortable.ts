import {NS_Configurable} from "./configurable";

export namespace NS_Shortable {
  export interface I_Shortable {
    getShortcuts(): Array<NS_Configurable.Group>
  }
}