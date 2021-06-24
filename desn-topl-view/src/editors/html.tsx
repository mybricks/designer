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