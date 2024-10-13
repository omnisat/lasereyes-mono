const core = require('@actions/core')
const exec = require('@actions/exec')

async function run() {
  try {
    const packageDir = core.getInput('package_dir')
    const tag = core.getInput('tag')

    // Navigate to the package directory
    process.chdir(packageDir)

    // Publish the package to npm
    await exec.exec(`npm publish --access public --tag ${tag}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
