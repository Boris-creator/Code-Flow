import {Render} from "./types"
import {delay} from "./utils"

export default class Renderer implements Render {
    constructor(element: HTMLElement) {
        this.output = element
    }

    private output: HTMLElement

    render(code: string) {
        const markup = [...code].reduce(({block, currentLine}, symbol, i) => {
            if (symbol === "\n" || i === 0) {
                const line = document.createElement("div")
                line.classList.add("line")
                block.append(line)
                currentLine = line
            }
            if (symbol === "\n") {
                return {block, currentLine}
            }
            const char = document.createElement("div")
            char.classList.add("char")
            char.dataset.index = `${i}`
            char.textContent = symbol
            currentLine.append(char)
            return {block, currentLine}
        }, {block: document.createElement("div"), currentLine: null}).block
        this.output.innerHTML = markup.outerHTML
    }

    async renderStep(step: { diapason: number[], diapasonScope: number[] }) {
        const {diapason, diapasonScope} = step
        document.querySelectorAll(".char.active").forEach(el => el.classList.remove("active"))
        document.querySelectorAll(".char.activeScope").forEach(el => el.classList.remove("activeScope"))

        await delay(0)
        diapason.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("active"))
        diapasonScope.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("activeScope"))
    }
}
