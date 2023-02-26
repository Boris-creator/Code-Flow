import {Render, Scope, TypedNode} from "./types"
import {delay} from "./utils"
import {Diagram} from "./Diagram"

export class Drawer implements Render {
    constructor(diagram: Diagram<any>, sourceMap: Map<any, any>, scopes: Scope[], element: HTMLElement) {
        this.diagram = diagram
        this.scopes = scopes
        this.output = element
    }

    private output: HTMLElement
    private diagram: Diagram<TypedNode>
    private scopes: Scope[]

    render() {
        const [, , commonWidth, commonHeight] = this.output.getAttribute("viewBox")!.split(" ").map(Number)
        const drawRect = (x: number, y: number, width: number, height: number) => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttribute("x", `${x}`)
            rect.setAttribute("y", `${y}`)
            rect.setAttribute("width", `${width}`)
            rect.setAttribute("height", `${height}`)
            rect.setAttribute("fill", "transparent")
            rect.setAttribute("stroke", "grey")
            rect.setAttribute("stroke-width", "0.2")

            this.output.append(rect)
            return rect
        }
        const {layout, ratio} = this.diagram.buildLayout(this.diagram.node, {
            x: 0,
            y: 0,
            width: commonWidth,
            height: commonHeight
        })
        //this.output.setAttribute("viewBox", `0 0 ${commonWidth} ${commonWidth * ratio}`) // TO DO
        for (const [nodeId, area] of layout.entries()) {
            const rect = drawRect(area.x, area.y, area.width, area.height)
            //rect.dataset.node = `${nodeId}`
        }
    }

    async renderStep(step: { diapason: number[], diapasonScope: number[] }) {
        const {diapason, diapasonScope} = step


    }
}

export default class Renderer implements Render {
    constructor(code: string, scopes: Scope[], element: HTMLElement) {
        this.code = code
        this.scopes = scopes
        this.output = element
    }

    private output: HTMLElement
    private code: string
    private scopes: Scope[]

    render() {
        const markup = [...this.code].reduce(({block, currentLine}, symbol, i) => {
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
            currentLine!.append(char)
            return {block, currentLine}
        }, {
            block: document.createElement("div"),
            currentLine: null
        } as { block: HTMLElement, currentLine: HTMLElement | null }).block
        this.output.innerHTML = markup.outerHTML
    }

    async renderStep(step: { diapason: number[], diapasonScope: number[] }) {
        const {diapason, diapasonScope} = step

        const currentScope = this.scopes.find(scope => scope.location === diapasonScope[0])
        if (currentScope) {
            console.log("variables", currentScope.variables.map(({name}) => name))
        }

        document.querySelectorAll(".char.active").forEach(el => el.classList.remove("active"))
        document.querySelectorAll(".char.activeScope").forEach(el => el.classList.remove("activeScope"))

        await delay(0)
        diapason.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("active"))
        diapasonScope.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("activeScope"))
    }
}
