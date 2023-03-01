import {Render, Scope, Node, TypedNode, Step, RenderOptions, Axis} from "./types"
import {delay} from "./utils"
import {Diagram} from "./Diagram"
type Position = {x: number, y: number, width: number, height: number}

export class Drawer implements Render {
    constructor(tree: Node<TypedNode | null>, sourceMap: Map<any, any>, scopes: Scope[], element: HTMLElement) {
        this.sourceMap = sourceMap
        this.diagram = new Diagram<TypedNode | null>(tree, function (node) {
            let options: RenderOptions = {
                axis: Axis.y
            }
            const specialCases = {
                VariableDeclarator: {
                    axis: Axis.x,
                    padding: 0,
                    margin: 0
                },
                ArrayPattern: {
                    isPrimitive: true
                },
                ArrayExpression: {
                    isVisible: false,
                    padding: 0,
                    axis: Axis.x
                }
            }
            if (node && node.type in specialCases) {
                const type = node.type as keyof typeof specialCases
                options = specialCases[type]
            }
            return options
        })
        this.scopes = scopes
        this.output = element
    }

    private output: HTMLElement
    private annotation: {area: SVGRectElement | null, label: SVGTextElement | null} = {area: null, label: null}
    private diagram: Diagram<TypedNode | null>
    private sourceMap: Map<Node<TypedNode>, any[]>
    private scopes: Scope[]

    render() {
        this.output.innerHTML = ""
        const [, , commonWidth, commonHeight] = this.output.getAttribute("viewBox")!.split(" ").map(Number)
        const {layout, ratio} = this.diagram.buildLayout(this.diagram.node, {
            x: 0,
            y: 0,
            width: commonWidth,
            height: commonHeight
        })
        //this.output.setAttribute("viewBox", `0 0 ${commonWidth} ${commonWidth * ratio}`) // TO DO
        for (const [nodeId, area] of layout.entries()) {
            const rect = this.drawRect(area, {
                fill: "transparent",
                stroke: "grey",
                "stroke-width": "0.2"
            })
            rect.dataset.node = `${nodeId}`
        }
    }

    private findNodeByLocation = (diapason: Pick<Step, "from" | "to">) => [...this.sourceMap.entries()].find(([node, [start, end]]) => start === diapason.from && end === diapason.to)?.[0]

    async renderStep(step: Step | null) {
        if (step === null) {
            this.annotation.area?.remove()
            return
        }
        const node = this.findNodeByLocation(step)
        if(!node) {
            return
        }
        const el = document.querySelector(`[data-node='${node.id}']`) as SVGGraphicsElement
        if(!this.annotation.area) {
            this.annotation.area = this.drawRect(el.getBBox(), {
                fill: "rgba(0, 100, 200, 0.5)"
            })
        } else {
            this.moveRect(this.annotation.area, el.getBBox())
        }
    }
    private drawRect = (position: Position, style: Record<string, string>) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(const attribute in style) {
            rect.setAttribute(attribute, style[attribute])
        }
        this.moveRect(rect, position)
        this.output.append(rect)
        return rect
    }
    private moveRect = (rect: SVGRectElement, position: Position) => {
        const {x, y, width, height} = position
        rect.setAttribute("x", `${x}`)
        rect.setAttribute("y", `${y}`)
        rect.setAttribute("width", `${width}`)
        rect.setAttribute("height", `${height}`)
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

    async renderStep(step: Step | null) {
        document.querySelectorAll(".char.active").forEach(el => el.classList.remove("active"))
        document.querySelectorAll(".char.activeScope").forEach(el => el.classList.remove("activeScope"))

        if (!step) {
            return
        }

        const {from, to, scope} = step
        const diapason = [...Array(to - from)].map((_, i) => i + from)
        const diapasonScope = [...Array(scope.to - scope.from)].map((_, i) => i + scope.from)
        const currentScope = this.scopes.find(scope => scope.location === diapasonScope[0])
        if (currentScope) {
            console.log("variables", currentScope.variables.map(({name}) => name))
        }

        await delay(0)
        diapason.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("active"))
        diapasonScope.forEach(index => document.querySelector(`.char[data-index="${index}"]`)?.classList.add("activeScope"))
    }
}
