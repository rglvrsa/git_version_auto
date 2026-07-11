import { readFileSync, writeFileSync } from 'fs';

// The CI/CD pipeline will pass the branch name as an argument
const branchName = process.argv[2];

if (!branchName) {
    console.error("Error: Please provide a branch name.");
    process.exit(1);
}

// 1. Read current version from package.json
const packagePath = './package.json';
const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));

// 2. Parse MAJOR, MINOR, PATCH
let [major, minor, patch] = packageData.version.split('.').map(Number);

// 3. Apply SemVer rules based on branch mapping
if (branchName.startsWith('hotfix/')) {
    // Small changes / bug fixes
    patch += 1;
    console.log(`Hotfix detected. Bumping PATCH version.`);
} else if (branchName.startsWith('feature/') || branchName === 'develop') {
    // New features 
    minor += 1;
    patch = 0; // Reset patch when minor increments
    console.log(`Feature/Develop merge detected. Bumping MINOR version.`);
} else if (branchName === 'main' || branchName.startsWith('release/')) {
    // Proper production release
    major += 1;
    minor = 0; // Reset minor
    patch = 0; // Reset patch
    console.log(`Main/Release merge detected. Bumping MAJOR version.`);
} else {
    console.log(`No version bump required for branch: ${branchName}`);
    process.exit(0);
}

// 4. Update and save the new version
const newVersion = `${major}.${minor}.${patch}`;
packageData.version = newVersion;

writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
console.log(`Successfully updated version to ${newVersion}`);