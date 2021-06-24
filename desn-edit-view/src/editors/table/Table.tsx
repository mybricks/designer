import css from './Table.less'
import {useCallback} from "react";
import {useObservable} from "@mybricks/rxui";

export default function Table(props) {
  const {value, options} = props

  const {columns} = options as {
    columns: {
      title: string, name: string, defaultValue: any
    }[]
  }

  const ctx = useObservable(class {
    ele: HTMLElement

    save() {
      const rtn = []
      const trs = this.ele.querySelectorAll('tr')
      for (let i = 0; i < trs.length; i++) {
        const inputs = trs[i].querySelectorAll('input')
        const trData = {}
        for (let j = 0; j < inputs.length; j++) {
          trData[inputs[j].name] = inputs[j].value
        }
        rtn.push(trData)
      }
      value.set(rtn)
    }
  })

  return (
    <div className={css.editor}>
      <table>
        <thead>
        <tr>
          {
            columns.map((col, idx) => {
              return (
                <td key={idx}>
                  {col.title}
                </td>
              )
            })
          }
        </tr>
        </thead>
        <tbody ref={ele => ele && (ctx.ele = ele)}>
        <tr>
          {
            columns.map((col, idx) => {
              return (
                <td key={idx}>
                  <input name={col.name} type='text' onBlur={ctx.save}/>
                </td>
              )
            })
          }
        </tr>
        </tbody>
      </table>
    </div>
  )

}