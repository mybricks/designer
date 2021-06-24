import {clone, Ignore, observable, Serializable} from '@mybricks/rxui';
import ToplBaseModel from '../ToplBaseModel';
import {E_ItemType} from '@mybricks/compiler-js';
import FrameModel from '../frame/FrameModel';
import {PinModel} from '../pin/PinModel';
import {JointModel} from '../joint/JointModel';
import {calJontPoints} from '../ToplUtil';
import {SerializeNS} from '../constants';
import {T_Controller, T_Po} from "./conTypes";
import {caculateBrokenLine, clonePo, isSamePo, refreshControllers, visitPoints} from "./conUtil";
import {CommentModel} from "./Comments";
import {I_ConModel} from "@sdk";
import {ToplComModel} from "../com/ToplComModel";
import DiagramModel from "../frame/diagram/DiagramModel";
import {getPosition} from "@utils";

@Serializable(SerializeNS + 'topl.ConModel')
export class ConModel extends ToplBaseModel implements I_ConModel {
  _type: E_ItemType.CONNECTION = E_ItemType.CONNECTION

  //State in connecting to other pins
  _ing: boolean = false

  @Ignore
  opacity

  title: string

  parent: FrameModel | DiagramModel

  errorInfo: string

  startPin: PinModel | JointModel

  finishPin: PinModel | JointModel

  @Ignore
  contextPoints: { [id: string]: Array<T_Po> }

  @Ignore
  _points: Array<T_Po>

  length: number//All count length of lines

  commentAry: CommentModel[] = []

  _startPo: T_Po

  constructor(arg) {
    super();
    if (arg) {
      const {startPin, finishPin, _points, _startPo, _finishPo, errorInfo} = arg
      this.startPin = startPin
      this.finishPin = finishPin
      this.errorInfo = errorInfo
      this._points = _points
      this._startPo = _startPo
      this._finishPo = _finishPo
    }
  }

  @Ignore
  get points() {
    return this._points
  }

  emphasize() {
    this.opacity = 1
  }

  emphasizeRecover() {
    this.opacity = void 0
  }

  get startPo(): T_Po {
    return this._startPo
  }

  set startPo(po) {
    if (isSamePo(this._startPo, po)) {
      return
    }
    this._startPo = po
    this.setPo(po, true)
  }

  @Ignore
  _finishPo: T_Po

  get finishPo(): T_Po {
    return this._finishPo
  }

  set finishPo(po) {
    //po.x+=0.5//Adjust
    if (isSamePo(this._finishPo, po)) {
      return
    }
    this._finishPo = po
    this.setPo(po)
  }

  connecting() {
    this._ing = true
  }

  connectFinish() {
    this._ing = false
  }

  get conSelf() {
    return this.startPin?.parent === this.finishPin?.parent
  }

  get titlePo(): T_Po {
    if (this._startPo && this._finishPo) {
      return {
        x: Math.min(this._finishPo.x, this._startPo.x) + Math.abs(this._finishPo.x - this._startPo.x) / 2,
        y: Math.min(this._finishPo.y, this._startPo.y) + Math.abs(this._finishPo.y - this._startPo.y) / 2,
      }
    }
  }

  static create0(start: PinModel | JointModel, finish?: PinModel | JointModel): ConModel {
    const con = observable(ConModel)

    if (start) {
      con.startPin = start
      if (start instanceof PinModel) {
        start.addCon(con)
      } else {
        start.to = con
      }

      const fromEle = start.$el
      if (fromEle) {
        const fromPo = getPosition(fromEle),
          fromSe = {w: fromEle.offsetWidth, h: fromEle.offsetHeight}

        const fromFrame = start.parent instanceof FrameModel ? start.parent : start.parent.parent as FrameModel
        const fromContainer: FrameModel | DiagramModel = fromFrame.currentDiagram || fromFrame
        const fromFramePo = getPosition(fromContainer.$el)

        con.startPo = {
          x: fromPo.x + fromSe.w - fromFramePo.x,
          y: fromPo.y + fromSe.h / 2 - fromFramePo.y,
          j: start.getJoinerWidth()
        }
      }
    }

    if (finish) {
      con.finishPin = finish
      if (finish instanceof PinModel) {
        finish.addCon(con)
      } else {
        finish.from = con
      }
      const toEle = finish.$el
      if (toEle) {
        const toPo = getPosition(toEle),
          toSe = {w: toEle.offsetWidth, h: toEle.offsetHeight};

        const toFrame = finish.parent instanceof FrameModel ? finish.parent : finish.parent.parent as FrameModel
        const toContainer = toFrame.currentDiagram || toFrame
        //console.log(toFrame.focusDiagram)
        const toFramePo = getPosition(toContainer.$el)

        con.finishPo = {
          x: toPo.x - toFramePo.x + 2,//For arrow
          y: toPo.y + toSe.h / 2 - toFramePo.y,
          j: finish.getJoinerWidth()
        }
      }
    }

    if (start && finish) {
      con.title = `从 ${start.title} 到 ${finish.title} 的连接`
    }

    return con
  }

  static create(start: PinModel | JointModel, startPo?,
                finish?: PinModel | JointModel, finishPo?): ConModel {
    const con = observable(ConModel)

    if (start) {
      con.startPin = start
      if (start instanceof PinModel) {
        start.addCon(con)
      } else {
        start.to = con
      }
    }
    if (startPo) {
      con.startPo = Object.assign({j: 10}, startPo)
    } else {
      const fromEle = start.$el
      if (fromEle) {
        const fromPo = getPosition(fromEle),
          fromSe = {w: fromEle.offsetWidth, h: fromEle.offsetHeight}

        const fromFrame = start.parent instanceof FrameModel ? start.parent : start.parent.parent as FrameModel
        const fromContainer: FrameModel | DiagramModel = fromFrame.currentDiagram || fromFrame
        const fromFramePo = getPosition(fromContainer.$el)

        startPo = {
          x: fromPo.x + fromSe.w - fromFramePo.x,
          y: fromPo.y + fromSe.h / 2 - fromFramePo.y,
          j: start.getJoinerWidth()
        }
      }
    }

    if (finish) {
      con.finishPin = finish
      if (finish instanceof PinModel) {
        finish.addCon(con)
      } else {
        finish.from = con
      }
    }
    if (finishPo) {
      //finishPo.x+=0.5//Adjust it
      con.finishPo = Object.assign({j: 10}, finishPo)
    }

    if (start && finish) {
      con.title = `从 ${start.title} 到 ${finish.title} 的连接`
    }

    return con
  }

  enable() {
    this.state.enable()
  }

  disable() {
    this.state.disable()
  }

  focus() {
    if (!this.state.isDisabled() && !this.state.isFocused()) {
      this.state.focus()

      this.startPin.focus(true)
      this.finishPin.focus(true)
    }
  }

  blur() {
    if (this.state.isFocused()) {
      super.blur()
      this.startPin.blur()
      this.finishPin.blur()
      if (this.commentAry) {
        this.commentAry.forEach(comment => {
          comment.blur()
        })
      }
    }
  }

  calJontPoints(points: Array<{ x: number; y: number }>) {
    // this.points.forEach(p=>{
    //   console.log(p.x,p.y)
    // })
    // console.log(points)
    return calJontPoints(this.points, points)
  }

  addComment(content: string, {x: cx, y: cy}: { x: number, y: number }): CommentModel {
    const comment = new CommentModel(this, content, {x: cx, y: cy})
    this.commentAry.push(comment)

    comment.focus()

    return comment
  }

  removeComment() {
    this.commentAry = this.commentAry.filter(comment => !comment.state.isFocused())
  }

  reset() {
    let points = caculateBrokenLine(this._startPo, this._finishPo, 'z', this.conSelf)
    this.refactorPoints(points)
  }

  refreshPoints() {
    const tolerance = 15
    const points = this.points
    //Remove in three-point line

    this.points = points.filter((pt, idx) => {
      if (idx > 1 && idx < points.length - 2) {
        let removeF
        //console.log(points[idx - 1].y ,points[idx].y ,  points[idx + 1].y)

        const dxPre = points[idx].x - points[idx - 1].x
        const dxNext = points[idx].x - points[idx + 1].x

        if (Math.abs(dxPre) < tolerance && Math.abs(dxNext) < tolerance) {
          removeF = true

          const dx = points[idx + 1].x - points[idx - 1].x
          if (points[idx - 2].x !== points[idx - 1].x) {
            points[idx - 1].x += dx
          } else {
            points[idx + 1].x -= dx
          }
        }

        const dyPre = points[idx].y - points[idx - 1].y
        const dyNext = points[idx].y - points[idx + 1].y

        if (Math.abs(dyPre) < tolerance && Math.abs(dyNext) < tolerance) {
          removeF = true

          const dy = points[idx + 1].y - points[idx - 1].y
          if (points[idx - 2].y !== points[idx - 1].y) {
            points[idx - 1].y += dy
          } else {
            points[idx + 1].y -= dy
          }
        }

        if (removeF) {
          return
        }
      }
      return pt
    })
  }

  calControllers(): T_Controller[] {
    const controllers: T_Controller[] = []
    const points = this.points
    points.forEach((pt, idx) => {
      if (idx > 1 && idx < points.length - 1) {
        let prePo = points[idx - 1]
        if (prePo.x == pt.x) {
          controllers.push({type: 'v', endPoints: [prePo, pt], allPoints: points})
        } else {
          controllers.push({type: 'h', endPoints: [prePo, pt], allPoints: points})
        }
      }
    })

    refreshControllers(controllers)

    return controllers
  }

  refreshComments() {
    if (this.commentAry.length > 0) {
      const allLength = this.length

      let curLength = 0, now
      visitPoints(this.points, (type, {x, y}, prePo) => {
        if (type === 'h') {
          now = Math.abs(x - prePo.x)

          this.commentAry.forEach(comment => {
            const currr = allLength * comment.ratio
            if (curLength < currr && currr < curLength + now) {
              let tx
              if (x < prePo.x) {
                tx = Math.max(x, prePo.x) - (currr - curLength)
              } else {
                tx = Math.min(x, prePo.x) + (currr - curLength)
              }
              comment.po = {x: tx, y}
            }
          })
          curLength += now
        } else {//v
          now = Math.abs(y - prePo.y)
          this.commentAry.forEach(comment => {
            const currr = allLength * comment.ratio
            if (curLength < currr && currr < curLength + now) {
              let ty
              if (y < prePo.y) {
                ty = Math.max(y, prePo.y) - (currr - curLength)
              } else {
                ty = Math.min(y, prePo.y) + (currr - curLength)
              }
              comment.po = {x, y: ty}
            }
          })

          curLength += now
        }
      })
    }
  }

  private setPo(po: T_Po, start?) {
    if (this._startPo && this._finishPo) {
      const points = this.points

      if (points) {
        if (start) {
          const startFixed = points.find(pt => pt.fixed)

          if (startFixed) {
            const ti = points.indexOf(startFixed)

            let fixed = points[ti + 1]
            let cpoints
            if (startFixed.x === points[ti + 1].x) {//v(x=x)
              const tpo = {x: startFixed.x, y: startFixed.y, j: po.j || 20}
              cpoints = caculateBrokenLine(po, tpo)
            } else {//h(y=y)
              if (po.x + po.j < startFixed.x) {
                cpoints = caculateBrokenLine(po, startFixed, '-|')
              } else {//Z type
                cpoints = caculateBrokenLine(po, startFixed)
              }
            }

            const leftPoints = points.slice(ti, points.length)

            const allPoints = cpoints.concat(leftPoints)

            this.refactorPoints(allPoints)

            if (fixed) {
              this.points.find((pt, idx) => {
                if (pt.id === fixed.id) {
                  this.points[idx - 1].fixed = true//Refresh
                }
              })
            }

            return
          }
        } else {
          let endFixed: T_Po, fixedIdx
          for (let ti = points.length - 1; ti >= 0; ti--) {
            if (points[ti].fixed) {
              fixedIdx = ti
              endFixed = points[ti]
              break
            }
          }
          if (endFixed) {
            let prePoints = points.slice(0, fixedIdx + 1)

            let cpoints
            if (endFixed.x === points[fixedIdx - 1].x) {//v(x=x)
              const tpo = {x: endFixed.x, y: endFixed.y}

              if (po.x - po.j < endFixed.x && po.y < endFixed.y) {
                cpoints = caculateBrokenLine(tpo, po, '-|')
              } else {
                cpoints = caculateBrokenLine(tpo, po)
              }
            } else {//h(y=y)
              if (po.x - po.j > endFixed.x) {
                cpoints = caculateBrokenLine(points[fixedIdx], po, '|-')
              } else {
                cpoints = caculateBrokenLine(points[fixedIdx], po)
              }
            }

            this.refactorPoints(prePoints.concat(cpoints))
            return
          }
        }
      }

      let cpoints
      if (this.conSelf) {
        cpoints = caculateBrokenLine(this._startPo, this._finishPo, 'z')////TODO
      } else {
        cpoints = caculateBrokenLine(this._startPo, this._finishPo, 'z')
      }

      this.refactorPoints(cpoints)
    }

    this.refreshComments()
  }

  private refactorPoints(pointsAry: Array<T_Po>) {
    const tolerance = 15

    function operator(ptAry) {
      let rtn = []
      let allLen = ptAry.length

      if (ptAry.length <= 3) {
        //all in a line
        ptAry = ptAry.map((po, idx) =>
          idx == 0 || idx == ptAry.length - 1 ? clonePo(po) : po
        )
        if (ptAry[0].y == ptAry[ptAry.length - 1].y) {
          return [ptAry[0], ptAry[ptAry.length - 1]]
        } else {
          return ptAry
        }
      }
      if (ptAry.length <= 4 &&
        Math.abs(ptAry[0].x - ptAry[ptAry.length - 1].x) <= tolerance
      ) {
        // 3~4  1~2 quadrants
        return ptAry.map((po, idx) =>
          idx == 0 || idx == ptAry.length - 1 ? clonePo(po) : po
        )
      }
      ptAry.forEach((po, idx) => {
        if (idx == 0) {
          rtn.push(po)
          return
        }
        const prePo = rtn[rtn.length - 1]
        let dx = prePo.x - po.x
        let dy = prePo.y - po.y

        if (dx == 0 && dy == 0) {//Remove same position point
          return
        }
        rtn.push(po)
      })

      // rtn.forEach((po, idx) => {
      //   if (idx >= 1 &&
      //     rtn[idx].x != rtn[idx - 1].x &&
      //     rtn[idx].y != rtn[idx - 1].y
      //   ) {
      //     if (rtn[idx].fixed || rtn[idx - 1]) {
      //       debugger
      //     }
      //
      //
      //     rtn[idx].x = rtn[idx - 1].x
      //   }
      // })

      return rtn
    }

    //Get copy
    pointsAry = pointsAry.map(pt => clonePo(pt, true))

    let length = 0

    let validPoints = operator(pointsAry)

    validPoints.forEach((p, idx) => {
      if (idx > 0) {
        let prePo = validPoints[idx - 1]
        if (prePo.x == p.x) {
          length += Math.abs(prePo.y - p.y)
        } else {
          length += Math.abs(prePo.x - p.x)
        }
      }
    })

    this.length = length
    this.points = validPoints
  }

  toJson() {
    let fromParent

    if (this.startPin instanceof JointModel) {
      const com = this.startPin.parent.parent
      fromParent = {
        type: 'frame',
        id: this.startPin.parent.id,
        comId: com.id,
        _key:com._key,
        comNS: com.runtime.def.namespace
      }
    } else {
      if (this.startPin.parent instanceof ToplComModel) {
        const com = this.startPin.parent
        fromParent = {
          type: 'com',
          id: com.id,
          comId: com.id,
          _key:com._key,
          comNS: com.runtime.def.namespace
        }
      } else {
        const com = this.startPin.parent.parent as ToplComModel
        fromParent = {
          type: 'frame',
          id: this.startPin.parent.id,
          comId: com.id,
          _key:com._key,
          comNS: com.runtime.def.namespace
        }
      }
    }

    const from = {
      id: this.startPin.id,
      hostId:this.startPin.hostId,
      title: this.startPin.title,
      type: this.startPin instanceof PinModel ? 'pin' : 'joint',
      parent: fromParent
    }

    let toParent

    if (this.finishPin instanceof JointModel) {
      const com = this.finishPin.parent.parent
      toParent = {
        type: 'frame',
        id: this.finishPin.parent.id,
        comId: com.id,
        _key:com._key,
        comNS: com.runtime.def.namespace
      }
    } else {
      if (this.finishPin.parent instanceof ToplComModel) {
        const com = this.finishPin.parent
        toParent = {
          type: 'com',
          id: com.id,
          comId: com.id,
          _key:com._key,
          comNS: com.runtime.def.namespace
        }
      } else {
        const com = this.finishPin.parent.parent as ToplComModel
        toParent = {
          type: 'frame',
          id: this.finishPin.parent.id,
          comId: com.id,
          _key:com._key,
          comNS: com.runtime.def.namespace
        }
      }
    }

    const to = {
      id: this.finishPin.id,
      hostId:this.finishPin.hostId,
      title: this.finishPin.title,
      type: this.finishPin instanceof PinModel ? 'pin' : 'joint',
      parent: toParent
    }

    return {
      from,
      to,
      errorInfo: clone(this.errorInfo),
      _points: clone(this._points),
      _startPo: clone(this._startPo),
      _finishPo: clone(this._finishPo)
    }
  }

  set points(ary: Array<T_Po>) {
    this._points = ary
    // const cpoints = this.contextPoints
    // if (cpoints) {
    //   Object.keys(cpoints).forEach(id => {
    //     if (id !== this.id) {
    //       const ary = cpoints[id]
    //       ary.forEach(point=>{
    //
    //       })
    //     }
    //   })
    //
    //
    //   this.contextPoints[this.id] = ary
    // }
  }

  destroy() {
    //console.time('--')
    this.parent.delete(this)
    if (this.startPin instanceof PinModel) {
      this.startPin.deleteCon(this)
    } else if (this.startPin instanceof JointModel) {
      this.startPin.destroy()
    }

    if (this.finishPin instanceof PinModel) {
      this.finishPin.deleteCon(this)
    } else if (this.finishPin instanceof JointModel) {
      this.finishPin.destroy()
    }
    //console.timeEnd('--')
  }
}