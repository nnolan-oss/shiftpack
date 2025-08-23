/**
 * Codemod: React Router v5 -> v6
 * Only removes match/url destructuring, nothing else
 */

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    function cleanParams(params) {
        if (
            params.length &&
            params[0].type === "ObjectPattern"
        ) {
            // Keep all props except `match`
            params[0].properties = params[0].properties.filter(p => {
                if (p.key && p.key.name === "match") return false;
                return true;
            });

            // If nothing left, remove param entirely
            if (params[0].properties.length === 0) {
                return [];
            }
        }
        return params;
    }

    // Function declarations
    root.find(j.FunctionDeclaration).forEach(path => {
        path.node.params = cleanParams(path.node.params);
    });

    // Arrow function components
    root.find(j.VariableDeclarator, {
        init: { type: "ArrowFunctionExpression" }
    }).forEach(path => {
        path.node.init.params = cleanParams(path.node.init.params);
    });

    // Replace `${url}` inside Route path
    root.find(j.JSXAttribute, { name: { name: "path" } }).forEach(path => {
        if (
            path.node.value.type === "JSXExpressionContainer" &&
            path.node.value.expression.type === "TemplateLiteral"
        ) {
            const tpl = path.node.value.expression;
            if (
                tpl.expressions.length === 1 &&
                tpl.expressions[0].name === "url"
            ) {
                const raw = tpl.quasis.map(q => q.value.raw).join("");
                if (raw === "") {
                    // `${url}` → "/"
                    path.node.value = j.stringLiteral("/");
                } else if (raw.startsWith("/")) {
                    // `${url}/list` → "list"
                    path.node.value = j.stringLiteral(raw.slice(1));
                }
            }
        }
    });

    return root.toSource({ quote: "double" });
}
