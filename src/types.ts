export type Step = { from: number, to: number, scope: { from: number, to: number } }
export interface Render {
    renderStep: (action: any) => Promise<void>
    render: (code: any) => void
}
