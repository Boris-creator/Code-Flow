import Player from "./Player"
import Helper from "./Parser"
import Render, {Drawer} from "./Render"

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
        const drawer = new Drawer(tree, sourceMap, scopes, diagram)
        const render = new Render(code, scopes, output)
        const player = new Player([drawer, render])
        drawer.render()
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

