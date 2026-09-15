/**
 * v2 rendered post-body anchors through an MDX provider that forced
 * target="_blank" on every link. Reproduced here as a build-time hast plugin.
 *
 * Shaped as a plain object rather than via satteri's `defineHastPlugin`, which is
 * only a typing helper and is not resolvable as a direct import under pnpm.
 */
export const hastTargetBlank = {
  name: 'target-blank',
  element: {
    filter: ['a'],
    visit(node) {
      return {
        ...node,
        properties: {
          ...node.properties,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
    },
  },
};
