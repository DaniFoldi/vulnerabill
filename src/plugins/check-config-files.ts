import { customFetch } from '../util/custom-fetch'
import { CheckPlugin } from './index'


const js = (file: string) => [ '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx' ].map(ext => file + ext)
const conf = (file: string) => [ '.json', '.yml', '.yaml', '.toml', '.conf' ].map(ext => file + ext)

export const plugin: CheckPlugin = {
  name: 'check-config-files',
  description: 'Check if configuration/administration files are accessible',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {
    const files = [
      '.htaccess', '.htpasswd', '.npmrc', '.yarnrc',
      'requirements.txt', 'Gemfile', 'Gemfile.lock', 'composer.json', 'composer.lock', 'yarn.lock',
      'gradle.properties', 'gradlew', 'gradlew.bat', 'build.gradle', 'settings.gradle', 'pom.xml',
      'Makefile', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
      '.dockerignore', '.gitignore', '.gitattributes', '.gitmodules', '.gitlab-ci.yml', '.gitlab-ci.yaml',
      '.github/workflows',
      'wp-admin.php', 'wp-config.php', 'wp-login.php',
      'build.xml', 'build.sh', 'build.bat', 'build.ps1',
      'deploy.sh', 'deploy.bat', 'deploy.ps1',
      ...js('next.config'), ...js('astro.config'), ...js('vite.config'), ...js('nuxt.config'),
      ...js('webpack.config'), ...js('rollup.config'), ...js('gulpfile'), ...js('gruntfile'),
      ...js('postcss.config'), ...js('babel.config'), ...js('jest.config'),
      ...conf('tsconfig'), ...conf('package'), ...conf('package-lock'), ...conf('wrangler'),
      ...conf('netlify'), ...conf('vercel'), ...conf('now'), ...conf('firebase')
    ]

    let found = false

    for (const file of files) {
      const response = await customFetch(`${options.site}/${file}`)
      if (response.status < 400) {
        found = true
        saveResult({
          confidence: 3,
          title: 'Configuration/administration file accessible',
          message: `Your site has a configuration/administration file accessible at ${file}`,
          severity: 3,
          description: 'Configuration/administration files should not be accessible to prevent information leakage.'
        })
      }
    }

    if (!found) {
      saveResult({
        confidence: 2,
        title: 'Configuration/administration files not found',
        message: 'Your site does not have accessible configuration/administration files',
        severity: 0,
        description: 'Configuration/administration files should not be accessible to prevent information leakage.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
