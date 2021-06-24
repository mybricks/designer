/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

export const ViewCfgDefault = {
  canvas: {
    type: 'mobile',//'mobile' | 'pc' | 'custom'
    layout: 'default',//'default' | 'absolute'
    overflowY: 'hidden'
  }, canvasMobile: {
    height: 670,
    width: 375
  }, canvasPC: {
    height: 799,
    width: 1099
  }, canvasCustom: {
    height: 400,
    width: 750
  }
}

export const TextEditorsReg = /^(plain|rich)text$/gi

export const EDITOR_RESERVED = {
  LIFECYCLE: {
    INIT: '@init'
  },
  RESIZEH: '@resizeH',
  RESIZEV: '@resizeV'
}
