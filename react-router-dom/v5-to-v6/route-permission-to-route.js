/**
 * jscodeshift transform
 *
 * npx jscodeshift -t transform.js src/
 */
export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    root.findJSXElements("RoutePermission").forEach(path => {
        const opening = path.node.openingElement;
        const attrs = opening.attributes;

        // Extract path attribute
        const pathAttr = attrs.find(a => a.name && a.name.name === "path");

        // Build new <Route> element
        const newElement = j.jsxElement(
            j.jsxOpeningElement(
                j.jsxIdentifier("Route"),
                [
                    // keep path="..."
                    pathAttr,
                    j.jsxAttribute(
                        j.jsxIdentifier("element"),
                        j.jsxExpressionContainer(
                            j.jsxElement(
                                j.jsxOpeningElement(
                                    j.jsxIdentifier("RoutePermission"),
                                    // remove path attr (already used in Route)
                                    attrs.filter(a => a.name && a.name.name !== "path"),
                                    true
                                ),
                                null,
                                [],
                                true
                            )
                        )
                    )
                ],
                true
            ),
            null,
            []
        );

        // Replace old node with new one
        j(path).replaceWith(newElement);
    });

    return root.toSource({ quote: "double" });
}
