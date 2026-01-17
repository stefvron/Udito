import { constants } from './constants.js';
import { hexToRgb, getLUTCoords } from './utils.js';

const module = await import('./dithering.js');
const renderer = new Worker('./lut_renderer.js', { type: 'module' });
let currentLUT = null;
const LUTCanvas = new OffscreenCanvas(0,0);

export async function applyFunction(canvas, args) {
    const func = module[args.algorithm.function_name];
    if (!func) {
        console.error(`Function ${args.algorithm.function_name} not found.`);
        return;
    }

    const LUTName = generateLUTName(args);
    if(currentLUT !== LUTName) {
        currentLUT = LUTName;
        const lutBitmap = await getLUT(args);
        if(lutBitmap.empty) {
            console.error('LUT generation failed.');
            return;
        }
        LUTCanvas
            .getContext('2d')
            .putImageData(lutBitmap, 0, 0);
    }

    const ctx = LUTCanvas.getContext('2d');
    const imageData = ctx.getImageData(0,0,LUTCanvas.width, LUTCanvas.height).data;
    const nearestColour = (c) => {
        const coords = getLUTCoords(
            ...c
        );
        const i = (coords.y * LUTCanvas.width + coords.x) * 4;
        return [
            imageData[i],
            imageData[i+1],
            imageData[i+2]
        ];
    }
    await func(canvas, nearestColour, args.errFac);
}

function generateLUTName(args) {
    return `${args.palette.id}_${args.comparison.id}`;
}
async function getLUT(args) {
    const factor = Math.sqrt(constants.lut.depth);
    const width = constants.lut.depth * factor;
    const height = constants.lut.depth * factor;
    LUTCanvas.width = width;
    LUTCanvas.height = height;

    renderer.postMessage({
        action: 'generateLUT',
        palette: args.palette.id,
        comparison: args.comparison.id
    });
    return new Promise((resolve) => {
        renderer.addEventListener('message', function onPreferences(event) {
            const { data } = event;
            if(data.action === 'setLUT') {
                if(!data.bitmap) return resolve({empty: true});
                resolve(data.bitmap);
            }
        });
    }); 
}


