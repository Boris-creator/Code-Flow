import {Step, Render} from "./types"
import {delay} from "./utils"

export default class Player {
    constructor(renderer: Render) {
        this.renderer = renderer
        const player = this;
        window.addEventListener("step", (ev: CustomEvent) => {
            player.add(ev.detail)
        })
    }

    private renderer: Render
    private stack: Step[] = []
    private interval = 2000

    add(step: Step) {
        this.stack.push(step)
    }

    async play() {
        if (!this.stack.length) {
            return
        }
        const {from, to, scope} = this.stack.shift();
        const diapason = [...Array(to - from)].map((_, i) => i + from)
        const diapasonScope = [...Array(scope.to - scope.from)].map((_, i) => i + scope.from)
        await this.renderer.renderStep({diapason, diapasonScope})
        await delay(this.interval)
        await this.play()
    }
}
