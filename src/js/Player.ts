import {Step, Render} from "./types"
import {delay} from "./utils"

export default class Player {
    constructor(renderers: Render[]) {
        this.renderers = renderers
        const player = this;
        window.addEventListener("step", (ev: CustomEvent) => {
            player.add(ev.detail)
        })
    }

    private renderers: Render[]
    private stack: Step[] = []
    private readonly interval = 2000
    private stepToken = {}

    add(step: Step) {
        this.stack.push(step)
    }

    async play() {
        if (!this.stack.length) {
            await this.render(null)
            return
        }
        const {from, to, scope} = this.stack.shift() as Step;
        const tokenSaved = await this.checkToken(
            async ()=> await this.render({from, to, scope})
        )
        if(!tokenSaved) {return}
        const tokenSavedOnPause = await this.checkToken(
            async ()=> await delay(this.interval)
        )
        if(!tokenSavedOnPause) {return}
        await this.play()
    }
    stop(){
        this.stepToken = {}
    }
    private async checkToken(action: ()=> Promise<any>): Promise<boolean> {
        const token = this.stepToken
        await action()
        return this.stepToken === token
    }
    private async render(step: Step | null) {
        return await Promise.all(this.renderers.map(renderer => renderer.renderStep(step)))
    }
}
