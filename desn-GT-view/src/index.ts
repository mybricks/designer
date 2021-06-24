import StageView from './StageView'
import {dump as dumpView} from '@mybricks/rxui'

export {StageView}

export function dumpCurrent(persistName) {
  return dumpView(persistName)
}
