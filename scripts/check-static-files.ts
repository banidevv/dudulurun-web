import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');

console.log('🔍 Checking static files in public directory...\n');

// Check if public directory exists
if (!fs.existsSync(publicDir)) {
    console.error('❌ Public directory does not exist!');
    process.exit(1);
}

// Check if images directory exists
if (!fs.existsSync(imagesDir)) {
    console.error('❌ Images directory does not exist!');
    process.exit(1);
}

// List all files in public directory
console.log('📁 Files in public directory:');
const publicFiles = fs.readdirSync(publicDir, { withFileTypes: true });
publicFiles.forEach(file => {
    if (file.isDirectory()) {
        console.log(`  📂 ${file.name}/`);
    } else {
        console.log(`  📄 ${file.name}`);
    }
});

console.log('\n🖼️  Files in images directory:');
const imageFiles = fs.readdirSync(imagesDir, { withFileTypes: true });
imageFiles.forEach(file => {
    if (file.isDirectory()) {
        console.log(`  📂 ${file.name}/`);
        const subFiles = fs.readdirSync(path.join(imagesDir, file.name));
        subFiles.forEach(subFile => {
            console.log(`    📄 ${subFile}`);
        });
    } else {
        console.log(`  📄 ${file.name}`);
    }
});

// Check race-packs directory
const racePacksDir = path.join(publicDir, 'race-packs');
console.log('\n🏃 Files in race-packs directory:');
if (fs.existsSync(racePacksDir)) {
    const racePackFiles = fs.readdirSync(racePacksDir, { withFileTypes: true });
    racePackFiles.forEach(file => {
        if (file.isDirectory()) {
            console.log(`  📂 ${file.name}/`);
            const subFiles = fs.readdirSync(path.join(racePacksDir, file.name));
            subFiles.forEach(subFile => {
                console.log(`    📄 ${subFile}`);
            });
        } else {
            console.log(`  📄 ${file.name}`);
        }
    });
} else {
    console.log('  ❌ Race-packs directory does not exist!');
}

// Check file permissions
console.log('\n🔐 Checking file permissions:');
const checkPermissions = (filePath: string, relativePath: string) => {
    try {
        const stats = fs.statSync(filePath);
        const permissions = stats.mode.toString(8).slice(-3);
        console.log(`  ${relativePath}: ${permissions} (${stats.isFile() ? 'file' : 'directory'})`);
    } catch (error) {
        console.error(`  ❌ Error checking ${relativePath}: ${error}`);
    }
};

checkPermissions(publicDir, 'public/');
checkPermissions(imagesDir, 'public/images/');
if (fs.existsSync(racePacksDir)) {
    checkPermissions(racePacksDir, 'public/race-packs/');
}

console.log('\n✅ Static files check completed!');
console.log('\n💡 If images are not loading in production, check:');
console.log('  1. Server configuration for static file serving');
console.log('  2. File permissions (should be 644 for files, 755 for directories)');
console.log('  3. Web server configuration (.htaccess, nginx config, etc.)');
console.log('  4. CDN or reverse proxy settings');
console.log('  5. Environment variables (ASSET_PREFIX, etc.)');
