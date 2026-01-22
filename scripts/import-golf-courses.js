const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, '../../골프장DB');
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

    // Simple heuristic parsing
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('총 홀수')) data.holeCount = lines[i + 1] || '';
        if (line.includes('전장') && !data.length) data.length = lines[i + 1] || '';
        if (line.includes('디자이너')) data.designer = lines[i + 1] || '';
        if (line.includes('위치정보')) {
            // Capture a few lines after location info
            data.address = lines[i + 1] + ' ' + (lines[i + 2] || '');
        }
    }

    // Description is loosely the text after basic info, but let's just take a snippet for now or leave it empty
    // as the format is quite variable.

    return data;
}

const courses = [];
const dirs = fs.readdirSync(SOURCE_DIR);

console.log(`Found ${dirs.length} directories in ${SOURCE_DIR}`);

dirs.forEach(dir => {
    const coursePath = path.join(SOURCE_DIR, dir);
    if (!fs.statSync(coursePath).isDirectory()) return;

    console.log(`Processing ${dir}...`);

    // 1. Parse Info
    const info = parseInfoTxt(path.join(coursePath, 'info.txt'));

    // 2. Handle Images
    // Generate ID from English name if available, otherwise use directory name
    let courseId = dir.replace(/\s+/g, '-');
    if (info.englishName) {
        courseId = info.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Fallback if empty (e.g. english name was just symbols)
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

    courses.push({
        id: courseId,
        ...info,
        images: images
    });
});

// 3. Generate TS file
const tsContent = `export interface Course {
  id: string;
  name: string;
  englishName: string;
  holeCount: string;
  length: string;
  designer: string;
  address: string;
  images: string[];
}

export const courses: Course[] = ${JSON.stringify(courses, null, 2)};
`;

fs.writeFileSync(DATA_FILE, tsContent);
console.log(`Generated ${DATA_FILE} with ${courses.length} courses.`);
