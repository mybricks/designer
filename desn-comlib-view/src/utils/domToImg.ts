var util = newUtil();
var inliner = newInliner();
var fontFaces = newFontFaces();
var images = newImages();

var defaultOptions = {
	imagePlaceholder: undefined,
	cacheBust: false
};

var domtoimage = {
	toPng: toPng,
	impl: {
		fontFaces: fontFaces,
		images: images,
		util: util,
		inliner: inliner,
		options: {}
	}
} as any;

function toSvg(node: Node, options?: any) {
	options = options || {};
	copyOptions(options);
	return Promise.resolve(node)
		.then(function (node) {
			return cloneNode(node, options.filter, true);
		})
		.then(embedFonts)
		.then(inlineImages)
		.then(applyOptions)
		.then(function (clone) {
			return makeSvgDataUri(clone,
				options.width || util.width(node),
				options.height || util.height(node)
			);
		});

	function applyOptions(clone: any) {
		if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;

		if (options.width) clone.style.width = options.width + 'px';
		if (options.height) clone.style.height = options.height + 'px';

		if (options.style)
			Object.keys(options.style).forEach(function (property) {
				clone.style[property] = options.style[property];
			});

		return clone;
	}
}

function toPng(node: Node, options?: any) {
	return draw(node, options || {})
		.then(function (canvas) {
			return canvas.toDataURL();
		});
}


function copyOptions(options: any) {
	if(typeof(options.imagePlaceholder) === 'undefined') {
		domtoimage.impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
	} else {
		domtoimage.impl.options.imagePlaceholder = options.imagePlaceholder;
	}

	if(typeof(options.cacheBust) === 'undefined') {
		domtoimage.impl.options.cacheBust = defaultOptions.cacheBust;
	} else {
		domtoimage.impl.options.cacheBust = options.cacheBust;
	}
}

function draw(domNode: Node, options?: any) {
	return toSvg(domNode, options)
		.then(util.makeImage)
		.then(util.delay(100))
		.then(function (image: any) {
      var canvas: any = newCanvas(domNode);
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas;
		});

  function newCanvas(domNode: Node) {
    var canvas = document.createElement('canvas');
    canvas.width = options.width || util.width(domNode);
    canvas.height = options.height || util.height(domNode);

    if (options.bgcolor) {
        var ctx: any = canvas.getContext('2d');
        ctx.fillStyle = options.bgcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

		return canvas;
	}
}

function cloneNode(node: Node, filter?: any, root?: any) {
  if (!root && filter && !filter(node)) return Promise.resolve();

  return Promise.resolve(node)
    .then(makeNodeCopy)
    .then(function (clone: any) {
      return cloneChildren(node, clone, filter);
    })
    .then(function (clone) {
      //@ts-ignore
      return processClone(node, clone);
    });

  function makeNodeCopy(node: Node) {
    if (node instanceof HTMLCanvasElement) return util.makeImage(node.toDataURL());
    return node.cloneNode(false);
  }

  function cloneChildren(original: Node, clone: Node, filter: any) {
    var children = original.childNodes;
    if (children.length === 0) return Promise.resolve(clone);

    //@ts-ignore
    return cloneChildrenInOrder(clone, util.asArray(children), filter)
      .then(function () {
          return clone;
      });

    function cloneChildrenInOrder(parent: Node, children: Node[], filter: any) {
      var done = Promise.resolve();
      children.forEach(function (child) {
        done = done
          .then(function () {
            return cloneNode(child, filter);
          })
          .then(function (childClone) {
            if (childClone) parent.appendChild(childClone);
          });
      });
      return done;
    }
  }

  function processClone(original: Element, clone: any) {
    if (!(clone instanceof Element)) return clone;

    return Promise.resolve()
      .then(cloneStyle)
      .then(clonePseudoElements)
      .then(copyUserInput)
      .then(fixSvg)
      .then(function () {
          return clone;
      });

    function cloneStyle() {
      copyStyle(window.getComputedStyle(original), clone.style);

      function copyStyle(source: any, target: any) {
        if (source.cssText) target.cssText = source.cssText;
        else copyProperties(source, target);

        function copyProperties(source: any, target: any) {
          util.asArray(source).forEach(function (name) {
            target.setProperty(
              name,
              source.getPropertyValue(name),
              source.getPropertyPriority(name)
            );
          });
        }
      }
    }

    function clonePseudoElements() {
      [':before', ':after'].forEach(function (element) {
        clonePseudoElement(element);
      });

      function clonePseudoElement(element: string) {
        var style = window.getComputedStyle(original, element);
        var content = style.getPropertyValue('content');

        if (content === '' || content === 'none') return;

        var className = util.uid();
        clone.className = clone.className + ' ' + className;
        var styleElement = document.createElement('style');
        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
        clone.appendChild(styleElement);

        function formatPseudoElementStyle(className: string, element: string, style: CSSStyleDeclaration) {
          var selector = '.' + className + ':' + element;
          var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
          return document.createTextNode(selector + '{' + cssText + '}');

          function formatCssText(styleL: CSSStyleDeclaration) {
            var content = style.getPropertyValue('content');
            return style.cssText + ' content: ' + content + ';';
          }

          function formatCssProperties(style: CSSStyleDeclaration) {
            //@ts-ignore
            return util.asArray(style)
              .map(formatProperty)
              .join('; ') + ';';

            function formatProperty(name: string) {
              return name + ': ' +
                style.getPropertyValue(name) +
                (style.getPropertyPriority(name) ? ' !important' : '');
            }
          }
        }
      }
    }

    function copyUserInput() {
      if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
      if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
    }

    function fixSvg() {
      if (!(clone instanceof SVGElement)) return;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      if (!(clone instanceof SVGRectElement)) return;
      ['width', 'height'].forEach(function (attribute) {
        var value = clone.getAttribute(attribute);
        if (!value) return;

        clone.style.setProperty(attribute, value);
      });
    }
  }
}

function embedFonts(node: Node) {
  return fontFaces.resolveAll()
    .then(function (cssText) {
      var styleNode = document.createElement('style');
      node.appendChild(styleNode);
      styleNode.appendChild(document.createTextNode(cssText));
      return node;
    });
}

function inlineImages(node: Node) {
  return images.inlineAll(node)
    .then(function () {
      return node;
    });
}

function makeSvgDataUri(node: any, width: string, height: string) {
  return Promise.resolve(node)
    .then(function (node) {
      node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      return new XMLSerializer().serializeToString(node);
    })
    .then(util.escapeXhtml)
    .then(function (xhtml) {
      return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>';
    })
    .then(function (foreignObject) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
          foreignObject + '</svg>';
    })
    .then(function (svg) {
      return 'data:image/svg+xml;charset=utf-8,' + svg;
    });
}

function newUtil() {
  return {
    escape: escape,
    parseExtension: parseExtension,
    mimeType: mimeType,
    dataAsUrl: dataAsUrl,
    isDataUrl: isDataUrl,
    canvasToBlob: canvasToBlob,
    resolveUrl: resolveUrl,
    getAndEncode: getAndEncode,
    uid: uid(),
    delay: delay,
    asArray: asArray,
    escapeXhtml: escapeXhtml,
    makeImage: makeImage,
    width: width,
    height: height
  };

  function mimes() {
    var WOFF = 'application/font-woff';
    var JPEG = 'image/jpeg';

    return {
      'woff': WOFF,
      'woff2': WOFF,
      'ttf': 'application/font-truetype',
      'eot': 'application/vnd.ms-fontobject',
      'png': 'image/png',
      'jpg': JPEG,
      'jpeg': JPEG,
      'gif': 'image/gif',
      'tiff': 'image/tiff',
      'svg': 'image/svg+xml'
    };
  }

  function parseExtension(url: string) {
    var match = /\.([^\.\/]*?)$/g.exec(url);
    if (match) return match[1];
    else return '';
  }

  function mimeType(url: string) {
    var extension = parseExtension(url).toLowerCase();
    //@ts-ignore
    return mimes()[extension] || '';
  }

  function isDataUrl(url: string) {
    return url.search(/^(data:)/) !== -1;
  }

  function toBlob(canvas: any) {
    return new Promise(function (resolve) {
      var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
      var length = binaryString.length;
      var binaryArray = new Uint8Array(length);

      for (var i = 0; i < length; i++)
        binaryArray[i] = binaryString.charCodeAt(i);

      resolve(new Blob([binaryArray], {
        type: 'image/png'
      }));
    });
  }

  function canvasToBlob(canvas: any) {
    if (canvas.toBlob)
      return new Promise(function (resolve) {
        canvas.toBlob(resolve);
      });

    return toBlob(canvas);
  }

  function resolveUrl(url: string, baseUrl: string) {
    var doc = document.implementation.createHTMLDocument();
    var base = doc.createElement('base');
    doc.head.appendChild(base);
    var a = doc.createElement('a');
    doc.body.appendChild(a);
    base.href = baseUrl;
    a.href = url;
    return a.href;
  }

  function uid() {
    var index = 0;

    return function () {
      return 'u' + fourRandomChars() + index++;

      function fourRandomChars() {
        return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
      }
    };
  }

  function makeImage(uri: string) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = uri;
    });
  }

  function getAndEncode(url: string) {
    var TIMEOUT = 30000;
    if(domtoimage.impl.options.cacheBust) {
      url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
    }

    return new Promise(function (resolve) {
      var request = new XMLHttpRequest();

      request.onreadystatechange = done;
      request.ontimeout = timeout;
      request.responseType = 'blob';
      request.timeout = TIMEOUT;
      request.open('GET', url, true);
      request.send();

      var placeholder: any;
      if(domtoimage.impl.options.imagePlaceholder) {
        var split = domtoimage.impl.options.imagePlaceholder.split(/,/);
        if(split && split[1]) {
          placeholder = split[1];
        }
      }

      function done() {
        if (request.readyState !== 4) return;

        if (request.status !== 200) {
          if(placeholder) {
            resolve(placeholder);
          } else {
            fail('cannot fetch resource: ' + url + ', status: ' + request.status);
          }

          return;
        }

        var encoder = new FileReader();
        encoder.onloadend = function () {
          //@ts-ignore
          var content = encoder.result.split(/,/)[1];
          resolve(content);
        };
        encoder.readAsDataURL(request.response);
      }

      function timeout() {
        if(placeholder) {
          resolve(placeholder);
        } else {
          fail('timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url);
        }
      }

      function fail(message: string) {
        console.error(message);
        resolve('');
      }
    });
  }

  function dataAsUrl(content: string, type: string) {
    return 'data:' + type + ';base64,' + content;
  }

  function escape(string: string) {
    return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
  }

  function delay(ms: number) {
    return function (arg: any) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(arg);
        }, ms);
      });
    };
  }

  function asArray(arrayLike: string[]) {
    var array = [];
    var length = arrayLike.length;
    for (var i = 0; i < length; i++) array.push(arrayLike[i]);
    return array;
  }

  function escapeXhtml(string: string) {
    return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
  }

  function width(node: any) {
    var leftBorder = px(node, 'border-left-width');
    var rightBorder = px(node, 'border-right-width');
    return node.scrollWidth + leftBorder + rightBorder;
  }

  function height(node: any) {
    var topBorder = px(node, 'border-top-width');
    var bottomBorder = px(node, 'border-bottom-width');
    return node.scrollHeight + topBorder + bottomBorder;
  }

  function px(node: any, styleProperty: any) {
    var value = window.getComputedStyle(node).getPropertyValue(styleProperty);
    return parseFloat(value.replace('px', ''));
  }
}

function newInliner() {
  var URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

  return {
    inlineAll: inlineAll,
    shouldProcess: shouldProcess,
    impl: {
      readUrls: readUrls,
      inline: inline
    }
  };

  function shouldProcess(string: string) {
    return string.search(URL_REGEX) !== -1;
  }

  function readUrls(string: string) {
    var result = [];
    var match;
    while ((match = URL_REGEX.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result.filter(function (url) {
      return !util.isDataUrl(url);
    });
  }

  function inline(string: string, url: string, baseUrl: string, get?: any) {
    return Promise.resolve(url)
      .then(function (url) {
        return baseUrl ? util.resolveUrl(url, baseUrl) : url;
      })
      .then(get || util.getAndEncode)
      .then(function (data) {
        return util.dataAsUrl(data, util.mimeType(url));
      })
      .then(function (dataUrl) {
        return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
      });

      function urlAsRegex(url: string) {
        return new RegExp('(url\\([\'"]?)(' + util.escape(url) + ')([\'"]?\\))', 'g');
      }
  }

  function inlineAll(string: string, baseUrl: string, get?: any) {
    if (nothingToInline()) return Promise.resolve(string);

    return Promise.resolve(string)
      .then(readUrls)
      .then(function (urls) {
        var done = Promise.resolve(string);
        urls.forEach(function (url) {
          done = done.then(function (string) {
            return inline(string, url, baseUrl, get);
          });
        });
        return done;
      });

    function nothingToInline() {
      return !shouldProcess(string);
    }
  }
}

function newFontFaces() {
  return {
    resolveAll: resolveAll,
    impl: {
      readAll: readAll
    }
  };

  function resolveAll() {
    //@ts-ignore
    return readAll(document)
      .then(function (webFonts) {
        return Promise.all(
          webFonts.map(function (webFont: any) {
            return webFont.resolve();
          })
        );
      })
      .then(function (cssStrings) {
        return cssStrings.join('\n');
      });
  }

  function readAll() {
    //@ts-ignore
    return Promise.resolve(util.asArray(document.styleSheets))
      .then(getCssRules)
      .then(selectWebFontRules)
      .then(function (rules) {
        return rules.map(newWebFont);
      });

    function selectWebFontRules(cssRules: any) {
      return cssRules
        .filter(function (rule: any) {
          return rule.type === CSSRule.FONT_FACE_RULE;
        })
        .filter(function (rule: any) {
          return inliner.shouldProcess(rule.style.getPropertyValue('src'));
        });
    }

    function getCssRules(styleSheets: any) {
      var cssRules: any[] = [];
      styleSheets.forEach(function (sheet: any) {
        try {
            util.asArray(sheet.cssRules || []).forEach(cssRules.push.bind(cssRules));
        } catch (e) {
            console.log('Error while reading CSS rules from ' + sheet.href, e.toString());
        }
      });
      return cssRules;
    }

    function newWebFont(webFontRule: any) {
      return {
        resolve: function resolve() {
          var baseUrl = (webFontRule.parentStyleSheet || {}).href;
          return inliner.inlineAll(webFontRule.cssText, baseUrl);
        },
        src: function () {
          return webFontRule.style.getPropertyValue('src');
        }
      };
    }
  }
}

function newImages() {
  return {
    inlineAll: inlineAll,
    impl: {
      newImage: newImage
    }
  };

  function newImage(element: any) {
    return {
      inline: inline
    };

    function inline(get?: any) {
      if (util.isDataUrl(element.src)) return Promise.resolve();

      return Promise.resolve(element.src)
        .then(get || util.getAndEncode)
        .then(function (data) {
          return util.dataAsUrl(data, util.mimeType(element.src));
        })
        .then(function (dataUrl) {
          return new Promise(function (resolve, reject) {
            element.onload = resolve;
            element.onerror = reject;
            element.src = dataUrl;
          });
        });
    }
  }

  function inlineAll(node: any): any {
    if (!(node instanceof Element)) return Promise.resolve(node);

    return inlineBackground(node)
      .then(function () {
        if (node instanceof HTMLImageElement)
          return newImage(node).inline();
        else
          return Promise.all(
            //@ts-ignore
            util.asArray(node.childNodes).map(function (child) {
              return inlineAll(child);
            })
          );
      });

    function inlineBackground(node: any) {
      var background = node.style.getPropertyValue('background');

      if (!background) return Promise.resolve(node);
      //@ts-ignore
      return inliner.inlineAll(background)
        .then(function (inlined) {
          node.style.setProperty(
            'background',
            inlined,
            node.style.getPropertyPriority('background')
          );
        })
        .then(function () {
          return node;
        });
    }
  }
}

export default domtoimage