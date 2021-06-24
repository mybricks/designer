export function refactorStyle(style) {
  Object.keys(style).forEach(nm => {
    let val = style[nm];
    if (!val) {
      return
    }
    typeof val === 'number' && (val = '' + val)
    if (
      [
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'left',
        'top',
        'right',
        'bottom',
        'height',
        'width'
      ].includes(nm)
    ) {
      val = val.match(/[0-9]+$/gi) ? `${val}px` : val;
    } else if (nm === 'backgroundImage') {
      val = !val.match(/^url\(/gi) ? `url(${val})` : val;
    }
    // else if (nm === 'position') {
    //   val = ['absolute', 'fixed'].includes(val)
    //     ? 'absolute'
    //     : 'static'
    // }
    else if (nm.match(/(margin|padding)/gi)) {
      if (val.indexOf('px') == -1) {
        val = val.split(',').map(v => v + 'px').join(' ')
      }
    }
    style[nm] = val;
  })
}
