import Player from "./Player";
import Helper from "./Parser";
import Render, { Drawer } from "./Render";
import { Axis, Projection } from "./types";

const output = document.getElementById("program")!;
const input = document.querySelector("textarea")!;
const diagram = document.getElementById("diagram")!;
const tools = {
  play: document.querySelector(".play"),
  axis: document.getElementById("diagram-axis"),
  projection: document.getElementById("diagram-projection"),
  fit: document.getElementById("fit"),
} as Record<string, HTMLElement>;

declare global {
  interface Window {
    emit: (n: any) => void;
  }

  interface WindowEventMap {
    step: CustomEvent;
    "node:create": CustomEvent;
  }
  interface EventListenerObject {
    handleEvent(event: Event): void;
    state: any;
  }
}

const parser = new Helper();
let player: Player;
let drawer: Drawer;
let playerReady = false;

window.emit = function (n) {
  dispatchEvent(new CustomEvent("step", { detail: n }));
};
function play() {
  const code = input.value;
  if (code.trim() === "") {
    return;
  }
  try {
    if (!playerReady) {
      const {
        program: { code: newCode },
        scopes,
      } = parser.refactor(code);
      const { tree, sourceMap } = parser.convertToTree(code);
      drawer = new Drawer(tree, sourceMap, scopes, diagram);
      const render = new Render(code, scopes, output);
      player = new Player([drawer, render]);
      drawer.render();
      render.render();
      const f = new Function(newCode);
      f();
      playerReady = true;
    }
    player.play();
  } catch (err) {
    console.log(err);
  }
}
function stop() {
  player.stop();
}
document.addEventListener("DOMContentLoaded", () => {
  tools.play.addEventListener("click", {
    handleEvent() {
      this.state.onPause = !this.state.onPause;
      tools.play.textContent = this.state.onPause ? "play" : "pause";
      if (!this.state.onPause) {
        play();
      } else {
        stop();
      }
    },
    state: { onPause: true },
  } as EventListenerObject);

  /*const diagramAxis = tools.axis as HTMLSelectElement
    diagramAxis.addEventListener("input", function () {
        drawer.setSettings({axis: this.value as Axis})
    })*/
  const diagramProjection = tools.projection as HTMLSelectElement;
  diagramProjection.addEventListener("input", function () {
    drawer.setSettings({ projection: this.value as Projection });
  });
  const diagramRatio = tools.fit as HTMLInputElement;
  diagramRatio.addEventListener("input", function () {
    if (!this.checked) {
      diagram.setAttribute("viewBox", "0 0 100 100");
    }
    drawer.setSettings({ fitRatio: this.checked });
  });
  input.addEventListener("input", () => {
    playerReady = false;
  });
  input.focus();
});
