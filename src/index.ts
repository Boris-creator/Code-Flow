import Player from "./Player"
import Helper from "./Parser"
import Render from "./Render"

const output = document.getElementById("program");
const input = document.querySelector("textarea");

declare global {
    interface Window {
        emit: (n: any) => void
    }

    interface WindowEventMap {
        step: CustomEvent
    }
}

const render = new Render(output)
const player = new Player(render)
const parser = new Helper();

window.emit = function (n) {
    dispatchEvent(new CustomEvent("step", {detail: n}))
}
input.addEventListener("input", function () {
    const code = this.value;
    const newCode = parser.refactor(code).code;
    render.render(code)
    const f = new Function(newCode)
    f()
    player.play()
});


