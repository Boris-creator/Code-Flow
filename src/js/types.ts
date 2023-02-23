import {Identifier} from "@babel/types"

export type Step = { from: number, to: number, scope: { from: number, to: number } }
export type Scope = { variables: Identifier[], parent: Scope | null, location?: number }

export interface Render {
    renderStep: (action: any) => Promise<void>
    render: (code: any) => void
}
