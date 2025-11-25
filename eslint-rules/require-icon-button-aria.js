module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require aria-label on icon-only <Button /> usage when size="icon"',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name
        if (name !== 'Button') return

        let hasIconSize = false
        let hasAriaLabel = false

        for (const attr of node.attributes) {
          if (!attr) continue
          if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'size') {
            if (attr.value && attr.value.type === 'Literal' && attr.value.value === 'icon') {
              hasIconSize = true
            }
            if (attr.value && attr.value.type === 'JSXExpressionContainer' && attr.value.expression && attr.value.expression.type === 'Literal' && attr.value.expression.value === 'icon') {
              hasIconSize = true
            }
          }
          if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'aria-label') {
            hasAriaLabel = true
          }
        }

        if (hasIconSize && !hasAriaLabel) {
          context.report({ node, message: '<Button size="icon" /> must include an aria-label for accessibility.' })
        }
      },
    }
  },
}
