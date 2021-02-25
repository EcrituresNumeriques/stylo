import { writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { env }  from 'process'

const __dirname = dirname(fileURLToPath(import.meta.url))

;(async () => {
  const applicationConfig = {
    backendEndpoint: env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:3030',
    graphqlEndpoint: env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3030/graphql',
    exportEndpoint: env.SNOWPACK_PUBLIC_EXPORT_ENDPOINT || 'http://localhost:3060',
    processEndpoint: env.SNOWPACK_PUBLIC_PROCESS_ENDPOINT || 'http://localhost:9090',
    humanIdRegisterEndpoint: env.SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT || 'https://auth-test.huma-num.fr/register?service=http://localhost:3030/authorization-code/callback'
  }
  await writeFile(join(__dirname, '..', 'public', 'config.json'), JSON.stringify(applicationConfig), 'utf8')
})()
