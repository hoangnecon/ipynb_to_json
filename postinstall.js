const { execSync } = require('child_process');
const path = require('path');

// Function to run a command in a specific directory
const runCommand = (command, directory) => {
  console.log(`\n--- Running command: ${command} in ${directory} ---\n`);
  try {
    execSync(command, { stdio: 'inherit', cwd: directory });
  } catch (error) {
    console.error(`\n--- Error running command: ${command} in ${directory} ---\n`);
    throw error; // Re-throw the error to stop the script
  }
};

const main = () => {
  try {
    // Install frontend dependencies, ignoring any scripts
    runCommand('npm install --ignore-scripts', path.join(__dirname, 'frontend'));

    // Install backend dependencies
    runCommand('python -m pip install -r backend/requirements.txt', path.join(__dirname, 'backend'));

    console.log('\n--- All dependencies installed successfully! ---\n');
  } catch (error) {
    console.error('\n--- Failed to install all dependencies. Please check the errors above. ---\n');
    process.exit(1);
  }
};

main();