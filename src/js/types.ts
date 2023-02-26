import {Node as Code, Identifier} from "@babel/types"

export type Step = { from: number, to: number, scope: { from: number, to: number } }
export type Scope = { variables: Identifier[], parent: Scope | null, location?: number }
export type TypedNode = Pick<Code, "type" | "start" | "end">
export type Node<T> = {
    content: T | null,
    children: Node<T>[]
}
export interface Render {
    renderStep: (action: any) => void | Promise<void>
    render: (code: any) => void
}
export enum Axis {
    x = "x",
    y = "y"
}
export type RenderOptions = {
    axis?: Axis,
    isVisible?: boolean,
    isPrimitive?: boolean,
    margin?: number,
    padding?: number
}
