const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { glob } = require('glob');

async function revertPackageJson() {
  try {
    // Find all package.json files in the packages directory
    const packageJsonFiles = await glob('packages/*/package.json');

    for (const filePath of packageJsonFiles) {
      console.log(`Processing ${filePath}...`);
      
      // Read and parse the package.json
      const content = readFileSync(filePath, 'utf8');
      const packageJson = JSON.parse(content);
      
      let modified = false;

      // Update module field if it exists
      if (packageJson.module === './src/index.ts') {
        packageJson.module = './dist/index.js';
        modified = true;
      }

      // Update exports field if it exists
      if (packageJson.exports) {
        // Handle simple string case
        if (packageJson.exports['.'] === './src/index.ts') {
          packageJson.exports['.'] = './dist/index.js';
          modified = true;
        }
        
        // Handle object with conditions
        if (typeof packageJson.exports['.'] === 'object') {
          const exportsObj = packageJson.exports['.'];
          if (exportsObj.import === './src/index.ts') {
            exportsObj.import = './dist/index.js';
            modified = true;
          }
          if (exportsObj.require === './src/index.ts') {
            exportsObj.require = './dist/index.js';
            modified = true;
          }
        }
      }

      // Write back to file if changes were made
      if (modified) {
        writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`Reverted ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    }

    console.log('Finished reverting all package.json files');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

revertPackageJson(); 