const fs = require('fs');
const content = fs.readFileSync('data/kulitanPoints.ts', 'utf8');
const uStr = content.match(/"u":\s*\{[\s\S]*?"points":\s*(\[[\s\S]*?\])\s*\}/);
const points = JSON.parse(uStr[1]);
let refPerimeterLength = 0;
for (let i = 1; i < points.length; i++) {
  refPerimeterLength += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
}
console.log('Perimeter:', refPerimeterLength);
