import debuggerXG from './debugger/xg.json'
import debuggerRT from './debugger/Debugger'

import moduleXG from './module/xg.json'
import moduleRT from './module/runtime'
import moduleData from './module/data.json'

import ifXG from './if/xg.json'
import ifRT from './if/IF'

import forXG from './for/xg.json'
import forRT from './for/For'

import moduleJoinerRT from "./module-joiner/ModuleJoiner";
import moduleJoinerXG from "./module-joiner/xg.json";

import dialogInputs from './dialog-inputs'
import dialogOutputs from './dialog-proxy'

import {T_XGraphComDef} from "@sdk";

const lib = {
  id: 'xg-comlib',
  title: 'XGraph核心组件库',
  author: 'CMJ',
  icon: '',
  version: '1.0.1',
  comAray: [
    merge({
      xg: debuggerXG,
      rt: debuggerRT
    }),
    merge({
      xg: moduleXG,
      rt: moduleRT,
      data: moduleData
    }),
    merge({
      xg: ifXG,
      rt: ifRT
    }),
    merge({
      xg: forXG,
      rt: forRT
    }),
    merge({
      xg: moduleJoinerXG,
      rt: moduleJoinerRT
    }),
    merge(dialogInputs),
    merge(dialogOutputs)
  ],
  //visible: true,
  visible: false
}

export default lib

export function getCom(namespace: string): T_XGraphComDef {
  return lib.comAray.find(com => com.namespace === namespace) as T_XGraphComDef
}

function merge({xg, rt, data, editors, assistence}: { xg, rt, data?, editors?, assistence? }) {
  return Object.assign(xg, {
    runtime: rt,
    data,
    editors,
    assistence
  })
}