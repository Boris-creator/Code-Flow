import {
    ArrayPattern,
    callExpression,
    Identifier,
    identifier,
    memberExpression,
    Node,
    ObjectPattern
} from "@babel/types";
import {parse} from "@babel/parser";
import generate from "@babel/generator"
import traverse from "@babel/traverse";
import {Scope} from "./types"

type Entity = ObjectPattern | ArrayPattern | Identifier

class UniqueSet<T> {
    constructor(comparator: (ob1: T, ob2: T) => boolean, array: T[] = []) {
        this.array = array
        this.comparator = comparator
    }

    private array: T[] = []
    private comparator: (ob1: T, ob2: T) => boolean

    push(...newItems: T[]) {
        for (const newItem of newItems) {
            const existingIndex = this.array.findIndex(item => this.comparator(item, newItem))
            if (existingIndex !== -1) {
                this.array.splice(existingIndex, 1)
            }
            this.array.push(newItem)
        }
    }

    clear() {
        this.array.length = 0
    }

    [Symbol.iterator]() {
        return this.array[Symbol.iterator]()
    }
}

export default class Helper {
    refactor(code: string) {
        const parsed = parse(code)
        const scopes = this.findScopes(parsed)
        console.log(parsed)
        this.transform((parsed))
        return {program: generate(parsed), scopes}
    }

    private findScopes(node: Node) {
        const {collectIdentifiers} = this
        const scopes: Set<Scope> = new Set()
        let additionalVariables = new UniqueSet<Node>(Helper.eq)
        let currentScope: Scope = null
        traverse(node, {
            enter(path) {
                const node = path.node as Node & { body: Node[] }
                if (Array.isArray(node.body)) {
                    const outerVariables = currentScope ? [...currentScope.variables] : []
                    const variables = new UniqueSet(Helper.eq, outerVariables)
                    variables.push(...[...additionalVariables].map(Helper.parsePattern).flat())
                    const scope: Scope = {
                        variables: [...variables],
                        parent: currentScope,
                        location: node.start
                    }
                    currentScope = scope
                    scopes.add(scope)
                    additionalVariables.clear()
                    scope.variables = collectIdentifiers(scope.variables)
                }
            },
            FunctionDeclaration(path) {
                const {params} = path.node
                let argumentVariable: Node;
                for (let param of params) {
                    switch (param.type) {
                        case "AssignmentPattern":
                            argumentVariable = param.left
                            break
                        case "RestElement":
                            argumentVariable = param.argument
                            break;
                        default:
                            argumentVariable = param
                    }
                    additionalVariables.push(...collectIdentifiers([argumentVariable]))
                }
            },
            exit(path) {
                if (path.node.type !== "BlockStatement") {
                    return
                }
                currentScope = currentScope?.parent ?? null
            },
            VariableDeclaration(path) {
                currentScope?.variables.push(...collectIdentifiers(path.node.declarations.map(declarator => declarator.id)))
            }
        })
        return [...scopes]
    }

    private transform(node: Node) {
        const {createNode} = this
        traverse(node, {
            enter(path) {
                const node = path.node as Node & { body: Node[] };
                if (Array.isArray(node.body)) {
                    for (let childNode of [...node.body]) {
                        if (childNode.type === "FunctionDeclaration") {
                            continue
                        }
                        node.body.splice(node.body.indexOf(childNode), 0, createNode(JSON.stringify({
                            from: childNode.start, to: childNode.end, scope: {
                                from: node.start, to: node.end
                            }
                        })))
                    }
                }
            },
        });
    }

    private createNode(data: string): Node {
        return callExpression(memberExpression(identifier("window"), identifier("emit")), [identifier(data)])
    }

    private collectIdentifiers(nodes: Node[]) {
        return nodes.map(Helper.parsePattern).flat()
    }

    private static

    eq(i1
           :
           Node, i2
           :
           Node
    ) {
        if (i1.type == "Identifier" && i2.type == "Identifier") {
            return i1.name == i2.name;
        }
        return false;
    }

    private static parsePattern(node: Node): Identifier[] {
        if (node.type === "Identifier") {
            return [node]
        }
        if (node.type === "ObjectPattern") {
            const nodes: Identifier[] = []
            node.properties.forEach(property => {
                const node = property.type === "ObjectProperty" ? property.value : property.argument
                if (!["ObjectPattern", "ArrayPattern", "Identifier"].includes(node.type)) {
                    return
                }
                nodes.push(...Helper.parsePattern(node))
            })
            return nodes
        }
        if (node.type === "ArrayPattern") {
            return node.elements.reduce((acc, element) => [...acc, ...Helper.parsePattern(element)], [])
        }
        return []
    }
}
