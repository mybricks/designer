/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {uuid} from "../util";

interface Result {
  focusArea: any
  slot: any
  data: any
  output: any
  input: any
}

export default {
  logic: {
    '*': [
      {
        title: '添加输入项',
        type: 'Button',
        value: {
          set({data, input}: Result) {
            const idx = uuid()
            const title = `输入项${idx}`
            const hostId = `in${idx}`

            input.add(hostId, title, void 0, true)
          }
        }
      },
      {
        title: '添加输出项',
        type: 'Button',
        value: {
          set({data, output}: Result) {
            const idx = uuid()
            const title = `输出项${idx}`
            const hostId = `out${idx}`

            output.add(hostId, title, void 0, true)
          }
        }
      }
    ]
  }
}



