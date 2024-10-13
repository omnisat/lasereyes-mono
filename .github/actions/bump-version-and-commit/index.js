const core = require('@actions/core')
const exec = require('@actions/exec')
const { execSync } = require('child_process')

async function run() {
  try {
    const packageDir = core.getInput('package_dir')
    const versionType = core.getInput('version_type')
    const preid = core.getInput('preid') || ''

    // Navigate to the package directory
    process.chdir(packageDir)

    // Determine the version bump command
    let bumpCommand = `npm version ${versionType}`
    if (versionType === 'prerelease' && preid) {
      bumpCommand += ` --preid=${preid}`
    }

    // Execute the bump command
    execSync(bumpCommand, { stdio: 'inherit' })

    // Commit the version bump
    await exec.exec('git add .')
    await exec.exec('git commit -m "Version bump in ' + packageDir + '"')
    await exec.exec('git push')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
