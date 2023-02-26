import {Axis, Node, RenderOptions} from "./types"

type TreeNode<T> = {
    content: T | null,
    id: number,
    weightX: number,
    weightY: number,
    children: TreeNode<T>[]
}
type LayoutItem = {
    x: number,
    y: number,
    width: number,
    height: number,
}

export class Diagram<T> {
    constructor(node: Node<T>, prepare: (content: T) => RenderOptions) {
        this.prepare = prepare
        this.node = this.build(node)
    }

    readonly options = {
        axis: Axis.y,
        margin: .3,
        padding: .2,
        isVisible: true,
        isPrimitive: false
    }
    node: TreeNode<T>
    prepare: (content: T) => RenderOptions

    private autoIncrement = 0

    buildLayout(node: TreeNode<T>, area: LayoutItem): { layout: Map<TreeNode<T>["id"], LayoutItem>, ratio: number } {
        const layout: Map<number, LayoutItem> = new Map()
        const unitX = area.width / node.weightX
        const unitY = area.height / node.weightY
        const ratio = unitX / unitY
        const unit = unitX
        const scale = (rect: LayoutItem): LayoutItem => {
            const {x, y, width, height} = rect
            return {
                x: x * unitX,
                y: y * unitY,
                width: width * unitX,
                height: height * unitY
            }
        }
        const renderNode = (node: TreeNode<T>, area: LayoutItem) => {
            const prepared: typeof this.options = node.content ? Object.assign({...this.options}, this.prepare(node.content)) : this.options

            const {padding, margin} = prepared
            const nodeArea = {
                x: area.x,
                y: area.y,
                height: node.weightY,
                width: node.weightX
            }
            if (prepared.isVisible) {
                layout.set(node.id, scale(nodeArea))
            }
            if (prepared.isPrimitive) {
                return
            }
            const offset = {
                x: area.x + padding,
                y: area.y + padding,
                height: (node.weightY - padding * 2),
                width: (node.weightX - padding * 2)
            }
            node.children.forEach((c, i) => {
                renderNode(c, offset)
                if (prepared.axis === Axis.y) {
                    offset.y += c.weightY + margin
                } else {
                    offset.x += c.weightX + margin
                }
            })
        }
        renderNode(node, area)
        return {layout, ratio}
    }

    private build(node: Node<T>) {
        const tree = this.createNode(node);
        for (const child of node.children) {
            this.appendNode(tree, this.build(child))
        }
        return tree
    }

    private createNode(node: Node<T>): TreeNode<T> {
        this.autoIncrement++
        return {
            ...node,
            id: this.autoIncrement,
            weightX: 1,
            weightY: 1,
            children: []
        }
    }

    private appendNode(parent: TreeNode<T>, child: TreeNode<T>) {
        const parentOptions: typeof this.options = parent.content ? Object.assign({...this.options}, this.prepare(parent.content)) : this.options

        const {margin, padding, axis} = parentOptions

        if (!parent.children.length) {
            parent.weightX = child.weightX + padding * 2
            parent.weightY = child.weightY + padding * 2
        } else {
            const lengthwise = {
                [Axis.x]: "weightX",
                [Axis.y]: "weightY"
            }[axis] as Extract<keyof TreeNode<T>, "weightX" | "weightY">
            const transverse = {
                [Axis.x]: "weightY",
                [Axis.y]: "weightX"
            }[axis] as Extract<keyof TreeNode<T>, "weightX" | "weightY">
            parent[lengthwise] += margin
            parent[lengthwise] += child[lengthwise]
            parent[transverse] = Math.max(parent[transverse], child[transverse] + padding * 2)
        }
        parent.children.push(child);
    }
}

