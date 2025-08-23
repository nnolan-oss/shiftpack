export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
  
    // track react-router-dom imports
    let switchLocalName = null;
    let redirectLocalName = null;
  
    root.find(j.ImportDeclaration)
      .filter(path => path.node.source.value === "react-router-dom")
      .forEach(path => {
        path.node.specifiers.forEach(spec => {
          if (spec.imported?.name === "Switch") {
            switchLocalName = spec.local.name; // save local alias
            spec.imported.name = "Routes";
            spec.local.name = "Routes";
          }
          if (spec.imported?.name === "Redirect") {
            redirectLocalName = spec.local.name;
            spec.imported.name = "Navigate";
            spec.local.name = "Navigate";
          }
        });
      });
  
    // Replace only react-router-dom Switch
    if (switchLocalName) {
      root.findJSXElements(switchLocalName).forEach(path => {
        path.node.openingElement.name.name = "Routes";
        if (path.node.closingElement) {
          path.node.closingElement.name.name = "Routes";
        }
      });
    }
  
    // Replace only react-router-dom Redirect
    if (redirectLocalName) {
      root.findJSXElements(redirectLocalName).forEach(path => {
        path.node.openingElement.name.name = "Navigate";
        if (path.node.closingElement) {
          path.node.closingElement.name.name = "Navigate";
        }
  
        // add replace
        const hasReplace = path.node.openingElement.attributes.some(
          attr => attr.name?.name === "replace"
        );
        if (!hasReplace) {
          path.node.openingElement.attributes.push(
            j.jsxAttribute(j.jsxIdentifier("replace"))
          );
        }
      });
    }
  
    // Route updates
    root.findJSXElements("Route").forEach(path => {
      const attrs = path.node.openingElement.attributes;
  
      // remove "exact"
      const exactAttrIndex = attrs.findIndex(
        attr => attr.name?.name === "exact"
      );
      if (exactAttrIndex !== -1) {
        attrs.splice(exactAttrIndex, 1);
      }
  
      // component -> element
      const compAttrIndex = attrs.findIndex(
        attr => attr.name?.name === "component"
      );
      if (compAttrIndex !== -1) {
        const compAttr = attrs[compAttrIndex];
        const compName = compAttr.value.expression.name;
  
        attrs.splice(compAttrIndex, 1);
        attrs.push(
          j.jsxAttribute(
            j.jsxIdentifier("element"),
            j.jsxExpressionContainer(
              j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier(compName), [], true)
              )
            )
          )
        );
      }
    });
  
    return root.toSource({ quote: "double" });
  }
  