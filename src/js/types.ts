import {Node as Code, Identifier} from "@babel/types"

export type Step = { from: number, to: number, scope: { from: number, to: number } }
export type Scope = { variables: Identifier[], parent: Scope | null, location?: number }
export type TypedNode = Pick<Code, "type">
export type Node<T> = {
    content: T | null,
    children: Node<T>[],
    id: number
}

export interface Render {
    renderStep: (action: Step | null) => void | Promise<void>
    render: (code: any) => void
    setSettings?: (settings: any) => void
}

export enum Axis {
    x = "x",
    y = "y"
}
export enum AxisDirection {
    lengthwise = "lengthwise",
    transverse = "transverse"
}
export enum Projection {
    front = "front",
    side = "side"
}

export type RenderOptions = {
    axis: Axis,
    isVisible?: boolean,
    isPrimitive?: boolean,
    margin?: number,
    padding?: number
}
export type LayoutItem = {
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
}
export type Layout = { layout: Map<any, LayoutItem>, ratio: number }
