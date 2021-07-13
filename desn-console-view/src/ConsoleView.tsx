/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './ConsoleView.less'
import {dragable, observe, useComputed, useObservable} from "@mybricks/rxui";
import {formatDate, getPosition} from "@utils";
import {NS_Emits} from "@sdk";

class Ctx {
  ele: HTMLElement

  focusId: string

  height: number = 200

  logs: { id, type: 'info' | 'error' | 'warn', time, catelog: string, content: string, focus?, blur? }[] = []

  logsEle

  scroll() {
    setTimeout(v => {
      if (this.logsEle) {
        if (this.logsEle.scrollHeight > this.logsEle.clientHeight) {
          this.logsEle.scrollTop = this.logsEle.scrollHeight + 100
        }
      }
    })
  }
}

export default function ConsoleView({logger}) {
  const ctx = useObservable(Ctx)

  observe(NS_Emits.Logs, next => {
      function doLog(type, ...args) {
        let catelog, content, focus, blur

        args.forEach(arg => {
          if (typeof arg === 'string') {
            if (content === void 0) {
              content = arg
            } else {
              catelog = content
              content = arg
            }
          } else if (typeof arg === 'function') {
            if (focus === void 0) {
              focus = arg
            } else {
              blur = arg
            }
          } else if (typeof arg === 'object') {
            try {
              content = JSON.stringify(arg)
            } catch (ex) {
              content = `内容转换发生错误:${ex.message}`
            }
          }
        })

        if (content) {
          setTimeout(v => {//Cutoff observable
            const log = {
              id: 'log' + ctx.logs.length,
              type: type,
              time: new Date(),
              catelog,
              content,
              focus, blur
            }
            ctx.logs.push(log)
            ctx.scroll()
          })
        }
      }

      next({
        info(catelog, content: string, focus, blur) {
          doLog('info', ...arguments)
        },
        warn(catelog, content: string, focus, blur) {
          doLog('warn', ...arguments)
        },
        error(catelog, content: string, focus, blur) {
          doLog('error', ...arguments)
        }
      })
    }, {from: 'parents'}
  )

  const renderLogs = useComputed(() => {
    if (ctx.logs) {
      return (
        ctx.logs.map(log => {
          return (
            <div key={log.id}
                 className={`${css.log} ${css[log.type]} ${log.id && log.id === ctx.focusId ? css.logFocus : ''}`}
                 onMouseEnter={e => log.focus && log.focus()}
                 onMouseLeave={e => log.blur && log.blur()}>
              <span className={css.time}>[{formatDate(log.time, 'YY-mm-dd HH:MM:SS')}]</span>
              {
                log.catelog ? (
                  <span className={css.catelog}>[{log.catelog}]  </span>
                ) : null
              }
              <div className={css.content}>
                <pre>{log.content}</pre>
              </div>
            </div>
          )
        }))
    }
  })

  return ctx.logs.length > 0 ? (
    <>
      <div className={css.sperH} onMouseDown={moveConsole}/>
      <div className={css.console} style={{height: ctx.height}} ref={ele => ele && (ctx.ele = ele)}>
        <div className={css.title}>
          <span className={css.tt}>信息</span>
          <span className={css.clearIcon} onClick={clearLogs}/>
        </div>
        <div className={css.logs} ref={ele => {
          if (ele && !ctx.logsEle) {
            ctx.logsEle = ele
          }
        }}>
          {renderLogs}
        </div>
      </div>
    </>
  ) : null
}

function moveConsole(evt) {
  const ctx = observe(Ctx)

  let {x, y, w, h} = getPosition(ctx.ele);

  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'moving') {
      ctx.height = Math.max(h -= dy, 30)
      //ctx.onResize()
    }
  })
}

function clearLogs() {
  const ctx = observe(Ctx)
  ctx.logs = []
}

