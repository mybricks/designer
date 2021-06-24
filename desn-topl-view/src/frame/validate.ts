/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {ToplViewContext} from "./ToplView";
import FrameModel from "./FrameModel";
import {NS_XGraphComLib} from "@sdk";

export function validateAllFrames(frame: FrameModel, tvContext: ToplViewContext) {
  const {emitLogs} = tvContext
  if (frame.conAry) {
    const pre = frame.parent ? frame.parent.runtime.title + '中存在错误连接,' : ''
    frame.conAry.forEach(con => {
      if (con.parent !== frame) {
        con.parent = frame
        con.errorInfo = `错误的连接`
        emitLogs.error('数据错误', `${pre}连接(${con.title || '未标题'})归属的区域错误.`)
      }
    })
  }

  if (frame.comAry) {
    frame.comAry.forEach(com => {
      if (com.frames) {
        com.frames.forEach(frame => {
          validateAllFrames(frame, tvContext)
        })
      }
    })
  }
}

export function validateCurFrame(frame: FrameModel, tvContext: ToplViewContext) {
  const {emitLogs} = tvContext
  if (frame.conAry) {
    const pre = frame.parent ? frame.parent.runtime.title + '中存在错误连接,' : ''
    frame.conAry.forEach(con => {
      if (!con.startPin || !con.startPin.$el) {
        con.errorInfo = `输出项不存在`
        emitLogs.error('数据错误', `${pre}连接(${con.title || '未知'})的输出项不存在.`)
      }
      if (!con.finishPin || !con.finishPin.$el) {
        con.errorInfo += `输入项不存在`
        emitLogs.error('数据错误', `${pre}连接(${con.title || '未知'})的输入项不存在.`)
      }
    })
  }

  if (frame.comAry) {
    frame.comAry.forEach(com => {
      if (com.frames&&com.runtime.def.namespace!==NS_XGraphComLib.coms.module) {
        com.frames.forEach(frame => {
          validateCurFrame(frame, tvContext)
        })
      }
    })
  }
}