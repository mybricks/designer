/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './index.less';

import ComlibView from './coms/ComlibView'

import OutlineView from './outline/OutlineView'
import {useObservable} from "@mybricks/rxui";

class MyContext {
  activeTabId: string = 'coms'

  isActiveCatelog(id) {
    return this.activeTabId === id
  }

  switchTab(id): void {
    this.activeTabId = id;
  }
}

function ComsPanel({mode}) {
  const myContext = useObservable(MyContext);

  return (
    <div className={css.panel}>
      <div className={css.tabs}>
        <div className={`${css.tab} 
                         ${myContext.activeTabId === 'coms' ? css.tabActived : ''}`}
             onClick={() => myContext.switchTab('coms')}>
          组件
        </div>
        <div className={`${css.tab} 
                         ${myContext.activeTabId === 'outline' ? css.tabActived : ''}`}
             onClick={() => myContext.switchTab('outline')}>
          大纲
        </div>
      </div>
      <div style={{position: 'relative', display: myContext.activeTabId === 'coms' ? 'block' : 'none'}}>
        <ComlibView mode={mode}/>
        <div
          // className={`${!myContext.mode ? css.disCover : ''}`}
        ></div>
      </div>
      <div style={{display: myContext.activeTabId === 'outline' ? 'block' : 'none'}}>
        <OutlineView/>
      </div>
    </div>
  )
}

export {ComsPanel}