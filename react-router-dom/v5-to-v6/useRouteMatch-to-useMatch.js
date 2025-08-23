/**
 * jscodeshift codemod
 * Migration: react-router-dom v5 -> v6
 * Transforms:
 *   - useRouteMatch("/pattern") -> useMatch("/pattern")
 *   - useRouteMatch() -> useMatch("*")
 *   - match.url -> match?.pathnameBase
 *   - match.path -> match?.pattern.path
 */

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Update imports
    root.find(j.ImportDeclaration, { source: { value: "react-router-dom" } })
        .forEach(path => {
            let hasUseRouteMatch = false;

            path.node.specifiers = path.node.specifiers.filter(s => {
                if (s.imported && s.imported.name === "useRouteMatch") {
                    hasUseRouteMatch = true;
                    return false;
                }
                return true;
            });

            if (hasUseRouteMatch) {
                const existing = path.node.specifiers.map(s => s.imported && s.imported.name);
                if (!existing.includes("useMatch")) {
                    path.node.specifiers.push(j.importSpecifier(j.identifier("useMatch")));
                }
            }
        });

    // Replace useRouteMatch() calls
    root.find(j.CallExpression, { callee: { name: "useRouteMatch" } })
        .forEach(path => {
            if (path.node.arguments.length === 0) {
                // useRouteMatch() -> useMatch("*")
                j(path).replaceWith(
                    j.callExpression(j.identifier("useMatch"), [j.literal("*")])
                );
            } else {
                // useRouteMatch("/pattern") -> useMatch("/pattern")
                j(path).replaceWith(
                    j.callExpression(j.identifier("useMatch"), path.node.arguments)
                );
            }
        });

    // Replace match.url -> match?.pathnameBase
    root.find(j.MemberExpression, { property: { name: "url" } })
        .forEach(path => {
            if (path.node.object.name === "match") {
                j(path).replaceWith(
                    j.optionalMemberExpression(
                        j.identifier("match"),
                        j.identifier("pathnameBase"),
                        false,
                        true
                    )
                );
            }
        });

    // Replace match.path -> match?.pattern.path
    root.find(j.MemberExpression, { property: { name: "path" } })
        .forEach(path => {
            if (path.node.object.name === "match") {
                j(path).replaceWith(
                    j.optionalMemberExpression(
                        j.memberExpression(j.identifier("match"), j.identifier("pattern")),
                        j.identifier("path"),
                        false,
                        true
                    )
                );
            }
        });

    return root.toSource({ quote: "double" });
}
