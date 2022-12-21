function transform(src, id) {
  if (id.endsWith('.graphql') || id.endsWith('.gql')) {
    const schema = JSON.stringify(src);

    return {
      code: `import gql from 'graphql-tag';
      export default gql(${schema})`,
      map: null
    };
  }
}

export default function VitePluginGQL() {
  return {
    name: 'vite-plugin-gql',
    transform
  };
}
