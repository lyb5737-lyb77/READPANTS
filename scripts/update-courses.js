const fs = require('fs');

// Read the file
let content = fs.readFileSync('lib/courses-data.ts', 'utf-8');

// Simple find and replace - add country and region after each opening brace of a course object
// We need to match the pattern:   {\n    "id":
// And replace with:   {\n    "country": "Thailand",\n    "region": "Pattaya",\n    "id":

const pattern = /(\s+)\{(\r?\n\s+)"id":/g;
const replacement = '$1{$2"country": "Thailand",$2"region": "Pattaya",$2"id":';

const updated = content.replace(pattern, replacement);

fs.writeFileSync('lib/courses-data.ts', updated, 'utf-8');
console.log('Successfully updated courses-data.ts');
