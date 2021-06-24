/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export default function Icon({onClick,className,children}: { onClick: Function}) {
  const classNames = ['iconfont']
  if(className){
    classNames.push(className)
  }
  return (
    <i className={classNames.join(' ')} onClick={onClick} dangerouslySetInnerHTML={{__html: children[0]}}/>
  )
}