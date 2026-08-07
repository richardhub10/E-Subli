const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { svgPathProperties } = require('svg-path-properties');

const kulitanDataRaw = fs.readFileSync(path.join(__dirname, 'data/kulitanData.ts'), 'utf8');

let match;
const syllables = [];
const regex = /"latin":\s*"([^"]+)",\s*"kulitanSymbol":\s*"([^"]+)"/g;
while ((match = regex.exec(kulitanDataRaw)) !== null) {
  syllables.push({
    latin: match[1],
    kulitanSymbol: match[2]
  });
}

const fontPath = path.join(__dirname, 'assets/fonts/KulitanHandwriting-SemiBold.otf');
const buffer = fs.readFileSync(fontPath);
const font = opentype.parse(buffer.buffer);

const result = {};

syllables.forEach(syllable => {
  // Using 250 font size to match UI
  const fontPathObj = font.getPath(syllable.kulitanSymbol, 0, 0, 250);
  const svgPathStr = fontPathObj.toPathData();
  
  if (!svgPathStr || svgPathStr.trim() === '') {
    result[syllable.latin] = { path: '', offsetX: 0, offsetY: 0, points: [] };
    return;
  }
  
  const properties = new svgPathProperties(svgPathStr);
  const totalLength = properties.getTotalLength();
  
  const points = [];
  const numSamples = 200;
  
  if (totalLength > 0) {
    for (let i = 0; i <= numSamples; i++) {
      const lengthAtPoint = (i / numSamples) * totalLength;
      const point = properties.getPointAtLength(lengthAtPoint);
      points.push({ x: point.x, y: point.y });
    }
  }
  
  if (points.length > 0) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
      
    // Center the points so (0,0) is the middle of the ink.
    // We DO NOT scale them, so they remain at font size 250 scale.
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;
      
    const centeredPoints = points.map(p => ({
      x: p.x - centerX,
      y: p.y - centerY
    }));
    
    // We must also shift the raw path string so it is centered at (0,0).
    // The easiest way is to wrap it in a <G transform="translate(-centerX, -centerY)"> on the frontend!
    
    result[syllable.latin] = {
      path: svgPathStr,
      offsetX: -centerX,
      offsetY: -centerY,
      points: centeredPoints
    };
  } else {
    result[syllable.latin] = { path: '', points: [] };
  }
});

const outputPath = path.join(__dirname, 'data/kulitanPoints.ts');
const outputContent = `export type KulitanShapeData = {\n  path: string;\n  offsetX: number;\n  offsetY: number;\n  points: {x: number, y: number}[];\n};\n\nexport const kulitanPoints: Record<string, KulitanShapeData> = ${JSON.stringify(result, null, 2)};\n`;

fs.writeFileSync(outputPath, outputContent);
console.log('Successfully extracted paths and points for ' + syllables.length + ' syllables!');
