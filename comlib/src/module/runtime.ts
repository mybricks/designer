/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export default function ({env, slots}) {
  if (env.runtime) {
    const names = Object.keys(slots)
    const slotName = names[0]

    // Object.values(frames).forEach(frame => {
    //   frame(void 0,slotName)
    // })

    return slots[slotName].render(null,slotName)
  }
}