export default function Icon({onClick,className,children}: { onClick: Function}) {
  const classNames = ['iconfont']
  if(className){
    classNames.push(className)
  }
  return (
    <i className={classNames.join(' ')} onClick={onClick} dangerouslySetInnerHTML={{__html: children[0]}}/>
  )
}