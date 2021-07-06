/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './OutlineView.less';
import {observe, useObservable} from '@mybricks/rxui';
import {ICON_COM_DEFAULT, NS_Emits} from '@sdk';

export type ComItem = {
  id: string;
  title: string;
  visible: boolean;
  active: boolean;
  icon: string;
  model: any;
  items: ComItem[];
  focus(): boolean
  switchView(): boolean
  hasUI: boolean
  mocking: boolean
  isModule: boolean
  label: 'todo' | undefined
  curFrame: string;
}

export class ComOutlinerContext {
  coms: ComItem[] = [];
}

export default function OutlineView() {
  const outlinerContext = useObservable(ComOutlinerContext);

  observe(NS_Emits.Views, next => next({
    focusStage({outlines}) {
      outlinerContext.coms = outlines as any;
    }
  }), {from: 'parents'});

  return (
    <div className={css.view}>
      {/*<div className={css.titleBar}>*/}
      {/*  组件*/}
      {/*</div>*/}
      {/*<div className={css.body}>*/}
      {/*  */}
      {/*</div>*/}
      <RenderComs coms={outlinerContext.coms}/>
    </div>
  )
}

function RenderComs({coms}: { coms: ComItem[] }) {
  return (
    <div className={css.items}>
      {coms.map((com: ComItem) => {
        return (
          <RenderCom key={com.id} com={com}/>
        )
      })}
    </div>
  )
}

function RenderCom({com}: { com: ComItem }) {
  return (
    <>
      <div className={`${css.item} ${com.active ? css.active : ''} 
                       ${!com.hasUI ? css.noUI : ''}
                       ${com.isModule ? css.module : ''}
                       ${!com.visible ? css.hidden : ''}
                       `
      }
           onClick={com.focus}
           onDoubleClick={com.switchView}>
        <img className={css.comIcon}
          src={(com.icon === './icon.png' || !/^(https:)/.test(com.icon)) ? ICON_COM_DEFAULT : com.icon}/>
        {/*<img className={css.comIcon}*/}
        {/*     src={ICON_COM_DEFAULT}/>*/}
        <div className={css.comItemContent}>
          <span className={css.comName}>
            {com.title}
            <span>
              {com.isModule ? '模块' : ''}
            </span>
          </span>
          <span className={css.comInfo}>
            {!com.visible && '(隐藏)'}
          </span>
          {/*<span className={css.comInfo}>*/}
          {/*  {com.curFrame && `(${com.curFrame.title})`}*/}
          {/*</span>*/}
        </div>
      </div>
      {com?.items.length > 0 && (
        <RenderComs coms={com.items}/>
      )}
    </>
  )
}