/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export function inPosition(
  {x, y}: { x: number, y: number },
  {x: left, y: top, w, h}: { x: number, y: number, w: number, h: number }) {
  if (arguments[0] instanceof Node) {
    let po = getPosition(arguments[0])
    x = po.x
    y = po.y
  }
  if (arguments[1] instanceof Node) {
    let {x, y, w: tw, h: th} = getPosition((<Node>arguments[1]))
    left = x;
    top = y;
    w = tw;
    h = th;
  }

  return left < x && x < left + w
    &&
    top < y && y < top + h;
}

/**
 * Get dom's position
 * @param ele
 * @param relativeDom ele's some ancestor dom
 */
export function getPosition(ele, relativeDom?) {
  // if(!ele) debugger
  if (relativeDom) {
    let currPo = ele.getBoundingClientRect()
    let targetPo = relativeDom.getBoundingClientRect()

    return {
      x: currPo.left - targetPo.left,
      y: currPo.top - targetPo.top,
      w: ele.offsetWidth,
      h: ele.offsetHeight
    }
  } else {
    let po = ele.getBoundingClientRect()
    return {x: po.left, y: po.top, w: ele.offsetWidth, h: ele.offsetHeight}
  }
}