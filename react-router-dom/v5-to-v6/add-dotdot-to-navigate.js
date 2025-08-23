/**
 * jscodeshift codemod
 *
 * Fix: navigate("create") -> navigate("../create")
 *
 * Works for:
 *   const navigate = useNavigate();
 *   navigate("create");
 *
 * Usage:
 *   npx jscodeshift -t fix-relative-navigate.js src
 */

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Find variable names assigned from useNavigate()
    const navigateVars = new Set();

    root.find(j.VariableDeclarator, {
        init: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "useNavigate" },
        },
    }).forEach(path => {
        if (path.value.id.type === "Identifier") {
            navigateVars.add(path.value.id.name); // e.g. navigate, nav
        }
    });

    // Update calls
    root.find(j.CallExpression).forEach(path => {
        const callee = path.value.callee;

        if (
            callee.type === "Identifier" &&
            navigateVars.has(callee.name) &&
            path.value.arguments.length > 0
        ) {
            const arg = path.value.arguments[0];

            // handle string literal only
            if (arg.type === "StringLiteral") {
                const val = arg.value;

                if (val.startsWith("/") || val.startsWith("..")) {
                    return; // already absolute or relative
                }

                // prepend ../
                arg.value = `../${val}`;
            }
        }
    });

    return root.toSource({ quote: "double" });
}
