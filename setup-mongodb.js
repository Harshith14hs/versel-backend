const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to execute shell commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Function to create data directory
async function createDataDirectory() {
  const dataDir = path.join(os.homedir(), 'mongodb-data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created MongoDB data directory at: ${dataDir}`);
  }
  return dataDir;
}

// Function to check if MongoDB is installed
async function checkMongoDBInstallation() {
  try {
    await executeCommand('mongod --version');
    console.log('MongoDB is already installed');
    return true;
  } catch (error) {
    console.log('MongoDB is not installed');
    return false;
  }
}

// Function to install MongoDB
async function installMongoDB() {
  console.log('Installing MongoDB...');
  
  // Create MongoDB data directory
  const dataDir = await createDataDirectory();
  
  // Download MongoDB installer
  const downloadUrl = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.3-signed.msi';
  const installerPath = path.join(os.tmpdir(), 'mongodb-installer.msi');
  
  console.log('Downloading MongoDB installer...');
  await executeCommand(`curl -o "${installerPath}" "${downloadUrl}"`);
  
  // Install MongoDB
  console.log('Installing MongoDB...');
  await executeCommand(`msiexec /i "${installerPath}" /quiet`);
  
  // Create MongoDB service
  console.log('Creating MongoDB service...');
  await executeCommand('net stop MongoDB');
  await executeCommand('sc delete MongoDB');
  await executeCommand('"C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe" --install --dbpath="' + dataDir + '"');
  
  // Start MongoDB service
  console.log('Starting MongoDB service...');
  await executeCommand('net start MongoDB');
  
  console.log('MongoDB installation completed');
}

// Main function
async function setupMongoDB() {
  try {
    const isInstalled = await checkMongoDBInstallation();
    
    if (!isInstalled) {
      await installMongoDB();
    } else {
      // Try to start MongoDB service
      try {
        await executeCommand('net start MongoDB');
        console.log('MongoDB service started successfully');
      } catch (error) {
        console.log('MongoDB service is already running or failed to start');
      }
    }
    
    // Test MongoDB connection
    console.log('Testing MongoDB connection...');
    await executeCommand('mongosh --eval "db.version()"');
    
    console.log('MongoDB setup completed successfully');
  } catch (error) {
    console.error('Error during MongoDB setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupMongoDB(); 