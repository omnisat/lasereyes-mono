const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { glob } = require('glob');

async function updatePackageJson() {
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
      if (packageJson.module === './dist/index.js') {
        packageJson.module = './src/index.ts';
        modified = true;
      }

      // Update exports field if it exists
      if (packageJson.exports) {
        // Handle simple string case
        if (packageJson.exports['.'] === './dist/index.js') {
          packageJson.exports['.'] = './src/index.ts';
          modified = true;
        }
        
        // Handle object with conditions
        if (typeof packageJson.exports['.'] === 'object') {
          const exportsObj = packageJson.exports['.'];
          if (exportsObj.import === './dist/index.js') {
            exportsObj.import = './src/index.ts';
            modified = true;
          }
          if (exportsObj.require === './dist/index.js') {
            exportsObj.require = './src/index.ts';
            modified = true;
          }
        }
      }

      // Write back to file if changes were made
      if (modified) {
        writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`Updated ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    }

    console.log('Finished processing all package.json files');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePackageJson(); 