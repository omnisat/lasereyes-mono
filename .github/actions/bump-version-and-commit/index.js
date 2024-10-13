const core = require('@actions/core')
const { execSync } = require('child_process')

try {
  const packageDir = core.getInput('package_dir')
  const preid = core.getInput('preid') || ''
  const isMainBranch = core.getBooleanInput('is_main') || false

  // Set Git configuration in case it's not set
  execSync(
    'git config --global user.email "github-actions[bot]@users.noreply.github.com"'
  )
  execSync('git config --global user.name "github-actions[bot]"')

  // Bump the version
  if (preid) {
    execSync(`npm version prerelease --preid=${preid}`, { cwd: packageDir })
  } else {
    execSync('npm version patch', { cwd: packageDir })
  }

  // Commit the changes
  execSync('git add .')
  execSync(`git commit -m "Version bump in ${packageDir}"`)
  execSync('git push origin dev')
} catch (error) {
  core.setFailed(error.message)
}
