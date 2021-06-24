/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export default {
  '@init'({style}) {
    style.position = 'fixed'
    style.right = 0
    style.bottom = 0
  },
  '*': [],
  '[btn-commit]': {
    title: '确定',
    items: [
      {
        title: '标题',
        type: 'text',
        value: {
          get() {
            return '确定'
          },
          set() {

          }
        }
      },
      {
        title: '事件',
        items: [
          {
            title: '点击',
            type: 'button',
            sameAs: 'shortcut',
            value: {
              set({diagram}) {
                diagram.edit('commit')
              }
            }
          }
        ]
      }
    ]
  },
  '[btn-cancel]': {
    title: '取消',
    items: [
      {
        title: '标题',
        type: 'text',
        value: {
          get() {
            return '确定'
          },
          set() {

          }
        }
      },
      {
        title: '事件',
        items: [
          {
            title: '点击',
            type: 'button',
            sameAs: 'shortcut',
            value: {
              set({diagram}) {
                diagram.edit('cancel')
              }
            }
          }
        ]
      }
    ]
  }
}