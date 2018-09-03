const { resolve } = require('path');
const { readdirSync, writeFileSync } = require('fs');
const readlineSync = require('readline-sync');
const sqip = require('sqip');
const { rm, touch, mkdir } = require('shelljs');

const ROOT = process.cwd();
const makeQuestion = question => readlineSync.question(question);

let sourcePath = null;
let distPath = null;

while (!sourcePath) {
    sourcePath = makeQuestion('Source images folder? ');
}

while(!distPath) {
    distPath = makeQuestion('Distination folder? ');
}

if (distPath) {
    rm('-rf', resolve(ROOT, distPath));
    mkdir('-p', resolve(ROOT, distPath));
}

if (sourcePath) {
    const images = readdirSync(resolve(ROOT, sourcePath));
    const convertedImages = images
        .filter(filename => filename.match(/\.(jpg|jpeg|png)$/))
        .map(filename => ({ filename, path: resolve(ROOT, sourcePath, filename)}))
        .reduce(
            (acc, { filename, path }) => ([
                ...acc,
                Object.assign(
                    { filename },
                    sqip({ filename: path, numberOfPrimitives: 10, blur: 1 })
                )]),
            []
        );

    if (convertedImages.length > 0) {
        convertedImages.forEach(({ filename, final_svg, svg_base64encoded }) => {
            const name = filename.split('.')[0];
            const fileBase64ABS = `${resolve(ROOT, distPath, name)}.SQIP.base64.svg`;
            const fileSVGABS = `${resolve(ROOT, distPath, name)}.SQIP.svg`;
            touch(fileSVGABS);
            touch(fileBase64ABS);
            writeFileSync(fileSVGABS, final_svg);
            writeFileSync(fileBase64ABS, svg_base64encoded);
        });
    }
    console.dir(convertedImages, { colors: true, depth: 26 });
}