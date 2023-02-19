import {callExpression, identifier, memberExpression, Node} from "@babel/types";
import {parse} from "@babel/parser";
import generate from "@babel/generator"
import traverse from "@babel/traverse";

export default class Helper {
    program!: Node & { body?: any };
    refactor(code: string){
        const parsed = parse(code)
        this.transform((parsed))
        return generate(parsed)
    }
    private transform(node: Node) {
        const {createNode} = this
        traverse(node, {
            enter(path) {
                const node = path.node as Node & { body: Node[] };
                if (Array.isArray((node.body))) {
                    for(let childNode of [...node.body]) {
                        node.body.splice(node.body.indexOf(childNode), 0, createNode(JSON.stringify({from: childNode.start, to: childNode.end, scope: {
                                from: node.start, to: node.end
                            }})))
                    }
                }
            },
            VariableDeclaration(path) {
                const {declarations} = path.node;
                const [d] = declarations;
                console.warn(d.id);
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
}
