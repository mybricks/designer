/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export function lazyImg(dom) {
  var containerRect = dom.getBoundingClientRect();
  var isInView = function (ele) {
    var bounds = ele.getBoundingClientRect();
    return !(
      containerRect.right < bounds.left ||
      containerRect.left > bounds.right ||
      containerRect.bottom < bounds.top ||
      containerRect.top > bounds.bottom
    );
  };
  var setImage = function (url, dom) {
    var img = new Image();
    img.src = url;
    img.onload = function () {
      dom.setAttribute('src', url);
    }
  };
  var list = dom.querySelectorAll('img');
  Array.prototype.forEach.call(list, function (item, i) {
    var dataSrc = item.getAttribute('data-src');
    var src = item.getAttribute('src');
    if (dataSrc && dataSrc !== src && isInView(item)) {
      setImage(dataSrc, item);
    }
  });
  var bgList = dom.querySelectorAll('[data-src-background]');
  Array.prototype.forEach.call(bgList, function (item, i) {
    var dataSrc = item.getAttribute('data-src-background');
    var tempSrc = 'url(' + dataSrc + ')';
    var tarSrc = item.style.backgroundImage.replace(/'"/ig, '');
    if (tempSrc && tempSrc !== tarSrc && isInView(item)) {
      item.style.backgroundImage = 'url(' + dataSrc + ')';
    }
  });
}