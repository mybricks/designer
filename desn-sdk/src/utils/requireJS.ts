export function require(arr, callback) {
  if (!(arr instanceof Array)) {
    console.error("arr is not a Array");
    return false;
  }

  // REQ_TOTAL  标记已加载成功个数
  // EXP_ARR    记录各个模块的顺序
  // REQLEN     定义共需要加载多少个js
  let REQ_TOTAL = 0,
    EXP_ARR = [],
    REQLEN = arr.length;

  arr.forEach(function (req_item, index, arr) {
    // 创建script的标签并放到页面中
    const $script = createScript(req_item, index);
    document.body.appendChild($script);

    (function ($script) {
      //检测script的onload事件
      $script.onload = function () {
        REQ_TOTAL++;
        const script_index = $script.getAttribute('index');
        // 把导出对象放到数组中
        EXP_ARR[script_index] = this;

        //所有js加载成功后，执行callback函数。
        if (REQ_TOTAL == REQLEN) {
          callback && callback.apply(this, EXP_ARR);
        }
      }
    })($script);
  })
}

//创建一个script标签
function createScript(src, index) {
  const script = document.createElement('script');
  script.setAttribute('src', src);
  script.setAttribute('index', index);
  return script;
}