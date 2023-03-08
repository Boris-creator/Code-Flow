import { multiply } from "./utils";
import { Axis, Node, RenderOptions, LayoutItem, Layout } from "./types";

type TreeNode<T> = {
  content: T | null;
  id: number;
  weightX: number;
  weightY: number;
  weightZ: number;
  children: TreeNode<T>[];
};

export class Diagram<T> {
  constructor(
    prepare: (content: T, defaultOptions: RenderOptions) => RenderOptions
  ) {
    this.prepare = prepare;
    // this.node = this.build(node)
  }

  readonly options = {
    axis: Axis.y,
    margin: 0.3,
    padding: 0.2,
    isVisible: true,
    isPrimitive: false,
  };
  // node: TreeNode<T>
  prepare: (content: T, defaultOptions: RenderOptions) => RenderOptions;

  // private autoIncrement = 0
  setOptions(options: Pick<typeof this.options, "axis">) {
    Object.assign(this.options, options);
  }
  private transformLayout(
    layout: Layout["layout"],
    transformation: number[][]
  ) {
    const transformed: Layout["layout"] = new Map();
    for (const key of layout.keys()) {
      const { x, y, z, width, height, depth } = layout.get(key) as LayoutItem;
      const [x1, y1, z1] = multiply([x, y, z], transformation);
      const [width1, height1, depth1] = multiply(
        [width, height, depth],
        transformation
      );
      transformed.set(key, {
        x: x1,
        y: y1,
        z: z1,
        width: width1,
        height: height1,
        depth: depth1,
      });
    }
    return transformed;
  }
  rotateY(layout: Layout["layout"]) {
    return this.transformLayout(layout, [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
    ]);
  }
  squareLayout(layout: Layout) {
    const { layout: layoutItems, ratio } = layout;
    return this.transformLayout(layoutItems, [
      [1, 0, 0],
      [0, ratio, 0],
      [0, 0, 1],
    ]);
  }
  private scale = (
    rect: LayoutItem,
    scaling: { x: number; y: number; z: number }
  ): LayoutItem => {
    const { x, y, z, width, height, depth } = rect;
    return {
      x: x * scaling.x,
      y: y * scaling.y,
      z: z * scaling.z,
      width: width * scaling.x,
      height: height * scaling.y,
      depth: depth * scaling.z,
    };
  };
  buildLayout(tree: Node<T>, area: LayoutItem): Layout {
    const node = this.build(tree);
    const layout: Map<number, LayoutItem> = new Map();
    const unitX = area.width / node.weightX;
    const unitY = area.height / node.weightY;
    const ratio = node.weightY / node.weightX;
    const unitZ = area.depth / node.weightZ;

    const renderNode = (node: TreeNode<T>, area: LayoutItem, depth = 0) => {
      const prepared: typeof this.options = node.content
        ? Object.assign(
            { ...this.options },
            this.prepare(node.content, this.options)
          )
        : this.options;
      const { padding, margin } = prepared;
      const nodeArea = {
        x: area.x,
        y: area.y,
        z: area.z,
        height: node.weightY,
        width: node.weightX,
        depth: 1, //node.weightZ
      };
      if (prepared.isVisible) {
        layout.set(
          node.id,
          this.scale(nodeArea, {
            x: unitX,
            y: unitY,
            z: unitZ,
          })
        );
      }
      if (prepared.isPrimitive) {
        return;
      }
      const offset = {
        x: area.x + padding,
        y: area.y + padding,
        z: depth,
        height: node.weightY - padding * 2,
        width: node.weightX - padding * 2,
        depth: 1, //node.weightZ
      };
      node.children.forEach(c => {
        renderNode(c, offset, depth + 1 + margin);
        if (prepared.axis === Axis.y) {
          offset.y += c.weightY + margin;
        } else {
          offset.x += c.weightX + margin;
        }
      });
    };
    renderNode(node, area);
    return { layout, ratio };
  }

  private build(node: Node<T>) {
    const tree = this.createNode(node);
    for (const child of node.children) {
      this.appendNode(tree, this.build(child));
    }
    return tree;
  }

  private createNode(node: Node<T>): TreeNode<T> {
    // this.autoIncrement++
    return {
      ...node,
      // id: this.autoIncrement,
      weightX: 1,
      weightY: 1,
      weightZ: 1,
      children: [],
    };
  }

  private appendNode(parent: TreeNode<T>, child: TreeNode<T>) {
    const parentOptions: typeof this.options = parent.content
      ? Object.assign(
          { ...this.options },
          this.prepare(parent.content, this.options)
        )
      : this.options;

    const { margin, padding, axis } = parentOptions;

    if (!parent.children.length) {
      parent.weightX = child.weightX + padding * 2;
      parent.weightY = child.weightY + padding * 2;
    } else {
      const lengthwise = {
        [Axis.x]: "weightX",
        [Axis.y]: "weightY",
      }[axis] as Extract<keyof TreeNode<T>, "weightX" | "weightY">;
      const transverse = {
        [Axis.x]: "weightY",
        [Axis.y]: "weightX",
      }[axis] as Extract<keyof TreeNode<T>, "weightX" | "weightY">;
      parent[lengthwise] += margin;
      parent[lengthwise] += child[lengthwise];
      parent[transverse] = Math.max(
        parent[transverse],
        child[transverse] + padding * 2
      );
    }
    parent.weightZ = Math.max(parent.weightZ, child.weightZ + margin + 1);
    parent.children.push(child);
  }
}
