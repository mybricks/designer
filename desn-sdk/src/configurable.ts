import {FunctionComponent} from "react";
import {uuid} from "./utils";

export namespace NS_Configurable {
  export interface I_Configurable {
    getConfigs(onlyShortcuts: boolean): Category[]
  }

  class Base {
    id: string;

    title?: string;

    description?: string

    sameAsShortcut: boolean

    ifVisible: () => boolean

    constructor(title?: string, description?: string, sameAsShortcut?: boolean) {
      this.title = title
      this.description = description
      if (sameAsShortcut) {
        this.sameAsShortcut = sameAsShortcut
      }
    }
  }

  export class Category extends Base {
    constructor(title) {
      super(title)
      this.id = uuid()
    }

    groups: Array<Group> //编辑条目

    addGroup(group: Group) {
      (this.groups || (this.groups = [])).push(group)
    }
  }

//Group
  export class Group extends Base {
    fixedAt: 'top' | 'bottom'

    folded: boolean

    //constructor(title?: string, description?: string, sameAsShortcut?: boolean)
    constructor(opts: {
      title: string,
      description?: string,
      sameAsShortcut?: boolean,
      ifVisible?: () => boolean
    }) {
      if (typeof arguments[0] === 'object') {
        const {title, description, sameAsShortcut, ifVisible} = opts
        super(title, description, sameAsShortcut)
        if (typeof ifVisible === 'function') {
          this.ifVisible = ifVisible
        }
      } else {
        super(arguments[0], arguments[1], arguments[2])
      }
      this.id = uuid()
    }

    items: Array<Group | EditItem | RenderItem>

    shortcuts: Array<Group | EditItem | RenderItem>

    addItem(item: Group | EditItem | RenderItem | FunctionItem | Function | ErrorItem) {
      (this.items || (this.items = [])).push(item)
      if (item instanceof Group || item instanceof EditItem) {
        if (item.sameAsShortcut) {
          (this.shortcuts || (this.shortcuts = [])).push(item)
        }
      }
    }

    addItems(items: Array<Group | EditItem | RenderItem>) {
      if (items) {
        items.forEach(item => {
          this.addItem(item)
        })
      }
    }

    fixedAtBottom() {
      return this.fixedAt === 'bottom'
    }
  }

  export class ErrorItem extends Base {
    constructor(opt: {
      title: string,
      description?: string
    }, sameAsShortcut?: boolean) {
      super(opt.title, opt.description, sameAsShortcut)
    }
  }

  export class EditItem extends Base {
    type: string //编辑器类型

    selector: string

    options?: { inline: boolean; option: { label; key } } //表单编辑项

    value: { get: Function; set: Function } //取值/赋值 响应式操作

    ele: HTMLElement

    comEle: HTMLElement

    canvasEle: HTMLElement

    constructor(opt: {
      title: string,
      type,
      value,
      selector?: string,
      options?,
      ifVisible?,
      description?: string,
      ele?: HTMLElement,
      comEle?: HTMLElement,
      canvasEle?: HTMLElement
    }, sameAsShortcut?: boolean) {
      super(opt.title, opt.description, sameAsShortcut)

      this.type = opt.type;
      if (opt.selector) {
        this.selector = opt.selector
      }
      this.value = opt.value;
      this.options = opt.options
      if (typeof opt.ifVisible === 'function') {
        this.ifVisible = opt.ifVisible
      }
      if (opt.ele) {
        this.ele = opt.ele
      }
      if (opt.comEle) {
        this.comEle = opt.comEle
      }
      if (opt.canvasEle) {
        this.canvasEle = opt.canvasEle
      }
    }
  }

  export class FunctionItem extends Base {
    fn

    constructor(fn: Function) {
      super()
      this.fn = fn
    }
  }

//Item
  export class RenderItem extends Base {
    props: { [index: string]: any }
    content: FunctionComponent | string

    constructor(title: string, content: FunctionComponent | string, props?: { [index: string]: any }) {
      super(title)
      this.content = content;
      this.props = props
    }
  }
}