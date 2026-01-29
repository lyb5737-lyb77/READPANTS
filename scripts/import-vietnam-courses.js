const fs = require('fs');
const path = require('path');

const VIETNAM_SOURCE_DIR = path.resolve(__dirname, '../../골프장DB/베트남-하이퐁');
const PUBLIC_DIR = path.resolve(__dirname, '../public/images/courses');
const DATA_FILE = path.resolve(__dirname, '../lib/courses-data.ts');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function parseInfoTxt(filePath) {
    if (!fs.existsSync(filePath)) return {};

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim());

    const data = {
        name: lines[0] || '',
        englishName: lines[1] || '',
        holeCount: '',
        length: '',
        designer: '',
        address: '',
        description: ''
    };

    // Extract from Vietnamese golf course format
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('총 홀수')) data.holeCount = lines[i + 1] || '';
        if (line.includes('전장') && !data.length) data.length = lines[i + 1] || '';
        if (line.includes('디자이너')) data.designer = lines[i + 1] || '';

        // Extract address from the last line (usually contains Vietnamese address)
        if (i === lines.length - 2 && lines[i].includes('Việt Nam')) {
            data.address = lines[i];
        }
    }

    return data;
}

const vietnamCourses = [];
const dirs = fs.readdirSync(VIETNAM_SOURCE_DIR);

console.log(`Found ${dirs.length} directories in ${VIETNAM_SOURCE_DIR}`);

dirs.forEach(dir => {
    const coursePath = path.join(VIETNAM_SOURCE_DIR, dir);
    if (!fs.statSync(coursePath).isDirectory()) return;

    console.log(`Processing ${dir}...`);

    // 1. Parse Info
    const info = parseInfoTxt(path.join(coursePath, 'info.txt'));

    // 2. Handle Images
    let courseId = dir.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (info.englishName) {
        courseId = info.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Fallback if empty
    if (!courseId) {
        courseId = dir.replace(/\s+/g, '-');
    }
    const targetImgDir = path.join(PUBLIC_DIR, courseId);

    if (!fs.existsSync(targetImgDir)) {
        fs.mkdirSync(targetImgDir, { recursive: true });
    }

    const infoImgDir = path.join(coursePath, 'info_img');
    const photoDir = path.join(coursePath, 'photo');

    let images = [];

    // Helper to copy images
    const copyImages = (sourceDir) => {
        if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            files.forEach(file => {
                if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    const src = path.join(sourceDir, file);
                    const dest = path.join(targetImgDir, file);
                    fs.copyFileSync(src, dest);
                    images.push(`/images/courses/${courseId}/${file}`);
                }
            });
        }
    };

    copyImages(infoImgDir);
    copyImages(photoDir);

    // Sort images: prioritize "1.jpg" (or similar) as the main image
    images.sort((a, b) => {
        const fileA = path.basename(a);
        const fileB = path.basename(b);
        const isMainA = fileA.startsWith('1.');
        const isMainB = fileB.startsWith('1.');

        if (isMainA && !isMainB) return -1;
        if (!isMainA && isMainB) return 1;
        return fileA.localeCompare(fileB);
    });

    vietnamCourses.push({
        country: 'Vietnam',
        region: 'Haiphong',
        id: courseId,
        ...info,
        images: images
    });
});

console.log(`Processed ${vietnamCourses.length} Vietnam courses.`);
console.log('Vietnam Courses:', JSON.stringify(vietnamCourses, null, 2));

// Read existing courses-data.ts
const existingData = fs.readFileSync(DATA_FILE, 'utf-8');

// Extract existing courses array
const arrayStart = existingData.indexOf('export const courses: Course[] = [');
const arrayEnd = existingData.lastIndexOf('];');

if (arrayStart === -1 || arrayEnd === -1) {
    console.error('Could not find courses array in courses-data.ts');
    process.exit(1);
}

const beforeArray = existingData.substring(0, arrayStart);
const arrayContent = existingData.substring(arrayStart + 'export const courses: Course[] = ['.length, arrayEnd);

// Parse existing courses (it's JSON-like)
let existingCourses = [];
try {
    // Extract JSON array content and parse
    const jsonStr = '[' + arrayContent.trim() + ']';
    existingCourses = JSON.parse(jsonStr);
} catch (e) {
    console.error('Failed to parse existing courses:', e.message);
    process.exit(1);
}

// Append Vietnam courses
const allCourses = [...existingCourses, ...vietnamCourses];

// Write back
const newContent = beforeArray + 'export const courses: Course[] = ' + JSON.stringify(allCourses, null, 2) + ';\n';

fs.writeFileSync(DATA_FILE, newContent);
console.log(`Updated ${DATA_FILE} with ${vietnamCourses.length} Vietnam courses. Total: ${allCourses.length} courses.`);
