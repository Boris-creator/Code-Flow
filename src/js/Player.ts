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
    private interval = 2000

    add(step: Step) {
        this.stack.push(step)
    }

    async play() {
        if (!this.stack.length) {
            await this.render(null)
            return
        }
        const {from, to, scope} = this.stack.shift() as Step;
        await this.render({from, to, scope})
        await delay(this.interval)
        await this.play()
    }
    private async render(step: Step | null) {
        return await Promise.all(this.renderers.map(renderer => renderer.renderStep(step)))
    }
}
