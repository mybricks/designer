/**
 * Geograpy view
 *
 *
 * @author: CheMingjun(chemingjun@126.com)
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
