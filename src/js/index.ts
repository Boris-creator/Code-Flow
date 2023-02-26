import Player from "./Player"
import Helper from "./Parser"
import Render, {Drawer} from "./Render"
import {Diagram} from "./Diagram"
import {Axis, RenderOptions, TypedNode} from "./types";


const output = document.getElementById("program")!;
const input = document.querySelector("textarea")!;
const diagram = document.getElementById("diagram")!


declare global {
    interface Window {
        emit: (n: any) => void
    }

    interface WindowEventMap {
        step: CustomEvent,
        "node:create": CustomEvent,
    }
}

const parser = new Helper();

window.emit = function (n) {
    dispatchEvent(new CustomEvent("step", {detail: n}))
}
input.addEventListener("input", function () {
    const code = this.value;
    try {
        const {program: {code: newCode}, scopes} = parser.refactor(code);
        const {tree, sourceMap} = parser.convertToTree(code)
        const drawer = new Drawer(new Diagram<TypedNode | null>(tree, function (node) {
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
        }), sourceMap, scopes, diagram)
        drawer.render()
        const render = new Render(code, scopes, output)
        const player = new Player(render)
        render.render()
        console.log(tree)
        const f = new Function(newCode)
        f()
        player.play()
    } catch (err) {
        console.log(err)
    }
});
document.addEventListener("DOMContentLoaded", () => {
    input.focus()
})

