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
export default class Helper {
    program!: Node & { body?: any };


    refactor(code: string) {
        const parsed = parse(code)
        const scopes = this.findScopes(parsed)
        console.log(parsed)
        this.transform((parsed))
        return {program: generate(parsed), scopes}
    }
    private findScopes(node: Node){
        const scopes: Set<Scope> = new Set()
        let additionalVariables: Node[] = []
        let currentScope: Scope = null
        traverse(node, {
            enter(path) {
                const node = path.node as Node & { body: Node[] }
                if (Array.isArray(node.body)) {
                    const scope: Scope = {variables: currentScope ? [...currentScope.variables, ...additionalVariables] : [], parent: currentScope, location: node.start}
                    currentScope = scope
                    scopes.add(scope)
                    additionalVariables.length = 0
                    scope.variables = scope.variables.map(Helper.parsePattern).flat()
                }
            },
            FunctionDeclaration(path) {
                const {params} = path.node
                for(let param of params) {
                    switch (param.type) {
                        case "AssignmentPattern":
                            additionalVariables.push(param.left); break
                        case "RestElement":
                            additionalVariables.push(param.argument); break;
                        default:
                            additionalVariables.push(param);
                    }
                }
                additionalVariables = additionalVariables.map(Helper.parsePattern).flat()
            },
            exit(path){
                if(node.type !== "BlockStatement") {
                    return
                }
                currentScope = currentScope?.parent ?? null
            },
            VariableDeclaration(path){
                currentScope?.variables.push(...path.node.declarations.map(declarator => Helper.parsePattern(declarator.id)).flat())
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
                        node.body.splice(node.body.indexOf(childNode), 0, createNode(JSON.stringify({
                            from: childNode.start, to: childNode.end, scope: {
                                from: node.start, to: node.end
                            }
                        })))
                    }
                }
            },
            VariableDeclaration(path) {
                const {declarations} = path.node;
                const [d] = declarations;
                //console.warn(d.id);
            },
        });
    }

    private createNode(data: string): Node {
        return callExpression(memberExpression(identifier("window"), identifier("emit")), [identifier(data)])
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
    private static parsePattern(node: Node) : Identifier[] {
        if(node.type === "Identifier") {
            return [node]
        }
        if(node.type === "ObjectPattern") {
            const nodes: Identifier[] = []
            node.properties.forEach(property => {
                const node = property.type === "ObjectProperty" ? property.value : property.argument
                if(!["ObjectPattern", "ArrayPattern", "Identifier"].includes(node.type)) {
                    return
                }
                nodes.push(...Helper.parsePattern(node))
            })
            return nodes
        }
        if(node.type === "ArrayPattern") {
            return node.elements.reduce((acc, element) => [...acc, ...Helper.parsePattern(element)], [])
        }
        return []
    }
}
