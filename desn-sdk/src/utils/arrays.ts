/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

/**
 * 对多个数组进行foreach
 * 例:        Arrays.each(sth => {sth.state = 0}, this.itemModelAry, this.inputPins, this.outputPins)
 * @param fn each函数
 * @param args 遍历数组
 */
export function each<ItemType>(fn: (item: ItemType) => any, ...args) {
  args.forEach(ary => {
    ary && ary.forEach(fn)
  })
}

/**
 * 对多个数组进行find
 * 例:        Arrays.find(sth => {sth.state == 0}, this.itemModelAry, this.inputPins, this.outputPins)
 * @param fn each函数
 * @param args 遍历数组
 */
export function find(fn, ...args) {
  let rtn;
  args.find(ary => {
    if (ary) {
      return rtn = ary.find(sth => fn(sth))
    }
  })
  return rtn;
}

export function merge(...arys){
  let rtn = []
  arys.forEach(ary=>{
    rtn = rtn.concat(ary)
  })
  return rtn
}

export function length(...args):number {
  let rtn = 0;
  args.forEach(ary => {
    if (Array.isArray(ary)) {
      rtn+=ary.length
    }
  })
  return rtn;
}