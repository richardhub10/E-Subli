const fs = require('fs');
const content = fs.readFileSync('data/kulitanPoints.ts', 'utf8');
const regex = /"([^"]+)":\s*\{\s*"path":\s*""/g;
let match;
const empty = [];
while((match = regex.exec(content)) !== null) {
  empty.push(match[1]);
}
console.log('EMPTY:', empty.join(', '));
