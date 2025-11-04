const { execSync } = require('child_process');
const path = require('path');

<<<<<<< HEAD
=======
// Function to run a command in a specific directory
>>>>>>> 5fbd89e1940c5529e991b6f87c3bb3ecb6a1a785
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
<<<<<<< HEAD
    // Install frontend dependencies, ignoring any scripts
    runCommand('npm install --ignore-scripts', path.join(__dirname, 'frontend'));

    // Install backend dependencies
    runCommand('python -m pip install -r backend/requirements.txt', path.join(__dirname, 'backend'));
=======
    // Install frontend dependencies
    runCommand('npm install', path.join(__dirname, 'frontend'));

    // Install backend dependencies
    runCommand('python -m pip install -r requirements.txt', path.join(__dirname, 'backend'));
>>>>>>> 5fbd89e1940c5529e991b6f87c3bb3ecb6a1a785

    console.log('\n--- All dependencies installed successfully! ---\n');
  } catch (error) {
    console.error('\n--- Failed to install all dependencies. Please check the errors above. ---\n');
    process.exit(1);
  }
};

main();
