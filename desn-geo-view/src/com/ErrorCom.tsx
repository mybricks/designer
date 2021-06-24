import css from './GeoCom.less';
import {observe} from "@mybricks/rxui";
import {ComContext} from "./GeoCom";

export default function ErrorCom({msg}: { msg: string }) {
  const {model} = observe(ComContext, {from: 'parents'})

  return (
    <div ref={el => el && (model.$el = el)}
         className={`${css.error}`}>
      {msg}
    </div>
  )
}