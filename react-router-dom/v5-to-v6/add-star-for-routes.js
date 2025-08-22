import fs from "fs";
import path from "path";

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    root.find(j.JSXElement, { openingElement: { name: { name: "Route" } } })
        .forEach((routePath) => {
            const opening = routePath.value.openingElement;

            const elementAttr = opening.attributes.find(
                (attr) => attr.name && attr.name.name === "element"
            );
            if (!elementAttr) return;

            const expr = elementAttr.value.expression;
            if (
                expr.type === "JSXElement" &&
                expr.openingElement.name.name === "RoutePermission"
            ) {
                const compAttr = expr.openingElement.attributes.find(
                    (attr) => attr.name && attr.name.name === "component"
                );
                if (!compAttr) return;

                let compName = null;
                if (compAttr.value.type === "JSXExpressionContainer" &&
                    compAttr.value.expression.type === "Identifier") {
                    compName = compAttr.value.expression.name;
                }
                if (!compName) return;

                // Lazy importni topish
                const importDecl = root.find(j.ImportDeclaration).nodes().find((imp) =>
                    imp.specifiers.some((s) => s.local.name === compName)
                );
                if (!importDecl) return;

                let importPath = importDecl.source.value;

                // Lazy import bo‘lsa => () => import("...")
                const lazyMatch = importPath.match(/\(\s*\)\s*=>\s*import\(["'](.+)["']\)/);
                if (lazyMatch) importPath = lazyMatch[1];

                const dir = path.dirname(file.path);
                let compFile = path.resolve(dir, importPath);
                if (!fs.existsSync(compFile)) {
                    // .tsx yoki .ts qo‘shish
                    if (fs.existsSync(compFile + ".tsx")) compFile += ".tsx";
                    else if (fs.existsSync(compFile + ".ts")) compFile += ".ts";
                    else return;
                }

                const compSource = fs.readFileSync(compFile, "utf8");
                if (compSource.includes("<Route")) {
                    const pathAttr = opening.attributes.find(attr => attr.name && attr.name.name === "path");
                    if (pathAttr && pathAttr.value.type === "Literal" && !pathAttr.value.value.endsWith("/*")) {
                        pathAttr.value.value = pathAttr.value.value.replace(/\/?$/, "/*");
                    }
                }
            }
        });

    return root.toSource({ quote: "double" });
}
