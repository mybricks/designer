/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export function html(targetEle: HTMLElement): { val: (arg: { get?, set }) => any } {
  let callback

  targetEle.contentEditable = 'true'
  targetEle.focus()

  const range = document.createRange()
  range.selectNodeContents(targetEle)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)

  targetEle.onblur = function () {
    targetEle.contentEditable = 'false'
    callback.set(targetEle.innerText)
  }

  return {
    val(cb) {
      callback = cb
    }
  }
}