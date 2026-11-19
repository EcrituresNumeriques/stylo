// Loads environment variables from .env files with Node.js.
// Variables already set in the environment take precedence, then .env,
// then ../.env. Missing files are ignored.
// Must be loaded before any module that reads process.env.
for (const path of ['.env', '../.env']) {
  try {
    process.loadEnvFile(path)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
