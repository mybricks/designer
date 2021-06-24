/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {T_XGraphComLib} from "@sdk";
import {SlotModel} from "@mybricks/desn-geo-view";
import {FrameModel} from "@mybricks/desn-topl-view";

export type T_Page = {
    id: string,
    title: string,
    type?: 'dialog' | undefined,
    content: { [name: string]: {} },
    parentId?: string,
    children: T_Page[]
    isActive?: boolean,
    props?: {
        isHome: boolean
    }
    ele?: HTMLElement
}

export type T_Module = {
    instId: string
    title: string
    slot: SlotModel
    frame: FrameModel
}


export type T_DesignerConfig = {
    mode: 'dev' | 'pro' | undefined

    env: 'dev'

    '@x': 1

    title: string

    comlibLoader: () => Promise<T_XGraphComLib[]>

    comlibAdder: any

    pageLoader: () => (pageId?: string) => Promise<{
        focusPageId: string,
        pageAry: {
            id: string,
            isActive: boolean,
            props: {
                isHome: boolean
            },
            title: string,
            content: { [name: string]: {} }
        }[]
    }>

    editorLoader: ({type, title, value, options, _onError_}) => {}

    keymaps: () => { [keys: string]: () => void }

    stage: {
        '@x': 1 | 2
        zoom: number,
        type: 'pc' | 'mobile',
        layout: 'flow' | 'absolute'
        style: {
            height: number,
            width: number
        }
        configs: {
            title: string,
            items: {
                id: string,
                title: string,
                type: string,
                options?,
                value: {
                    get: () => any,
                    set: (v: any) => any
                }
            }[]
        }
    }

    debug: {
        envTypes: { id: string, title: string }[]
    }

    envAppenders: {
        runtime: {}
    }
}