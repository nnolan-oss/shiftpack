/**
 * jscodeshift transform: useHistory -> useNavigate (FULL)
 */
export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    let needsNavigate = false;

    // --- 1. Oddiy assignment: const history = useHistory(); ---
    root.find(j.VariableDeclarator, {
        init: { type: "CallExpression", callee: { name: "useHistory" } }
    }).forEach(path => {
        path.node.id = j.identifier("navigate");
        path.node.init.callee.name = "useNavigate";
        needsNavigate = true;
    });

    // --- 2. Destructuring: const { push, replace, goBack } = useHistory(); ---
    root.find(j.VariableDeclarator)
        .filter(path =>
            path.node.id.type === "ObjectPattern" &&
            path.node.init &&
            path.node.init.type === "CallExpression" &&
            path.node.init.callee.name === "useHistory"
        )
        .forEach(path => {
            path.replace(
                j.variableDeclarator(
                    j.identifier("navigate"),
                    j.callExpression(j.identifier("useNavigate"), [])
                )
            );
            needsNavigate = true;
        });

    // --- 3. history.* chaqiriqlarini almashtirish ---
    root.find(j.CallExpression, {
        callee: { type: "MemberExpression" }
    }).forEach(path => {
        const callee = path.node.callee;
        if (!callee.object || callee.object.name !== "history") return;

        const method = callee.property.name;

        if (method === "push") {
            path.node.callee = j.identifier("navigate");
        } else if (method === "replace") {
            const args = path.node.arguments;
            const urlArg = args[0];
            const stateArg = args[1] || null;

            const opts = [j.objectProperty(j.identifier("replace"), j.booleanLiteral(true))];
            if (stateArg) {
                opts.push(j.objectProperty(j.identifier("state"), stateArg));
            }

            path.node.callee = j.identifier("navigate");
            path.node.arguments = [urlArg, j.objectExpression(opts)];
        } else if (method === "go") {
            path.node.callee = j.identifier("navigate");
        } else if (method === "goBack") {
            path.node.callee = j.identifier("navigate");
            path.node.arguments = [j.literal(-1)];
        } else if (method === "goForward") {
            path.node.callee = j.identifier("navigate");
            path.node.arguments = [j.literal(1)];
        }
    });

    // --- 4. Destructured calls: push(...), replace(...), goBack() ---
    root.find(j.CallExpression, { callee: { type: "Identifier" } })
        .forEach(path => {
            const name = path.node.callee.name;
            if (["push", "replace", "go", "goBack", "goForward"].includes(name)) {
                const args = path.node.arguments;

                if (name === "replace") {
                    const urlArg = args[0];
                    const stateArg = args[1] || null;
                    const opts = [j.objectProperty(j.identifier("replace"), j.booleanLiteral(true))];
                    if (stateArg) opts.push(j.objectProperty(j.identifier("state"), stateArg));

                    path.node.arguments = [urlArg, j.objectExpression(opts)];
                } else if (name === "goBack") {
                    path.node.arguments = [j.literal(-1)];
                } else if (name === "goForward") {
                    path.node.arguments = [j.literal(1)];
                }

                path.node.callee = j.identifier("navigate");
                needsNavigate = true;
            }
        });

    // --- 5. Importlarni almashtirish (faqat kerak bo‘lsa) ---
    root.find(j.ImportDeclaration, { source: { value: "react-router-dom" } })
        .forEach(path => {
            const specifiers = path.node.specifiers.filter(
                s => !(s.imported && s.imported.name === "useHistory")
            );

            const hasUseNavigate = specifiers.some(
                s => s.imported && s.imported.name === "useNavigate"
            );

            if (needsNavigate && !hasUseNavigate) {
                specifiers.push(j.importSpecifier(j.identifier("useNavigate")));
            }

            path.node.specifiers = specifiers;
        });

    return root.toSource();
}
