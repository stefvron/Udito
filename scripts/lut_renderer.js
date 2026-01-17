import { config, constants } from "./constants.js";
import { applyShader, getLUTCoords } from "./utils.js";

const originalCanvas = new OffscreenCanvas(0,0);
generateBlankLUT();
const renderCanvas = new OffscreenCanvas(0,0);

onmessage = async function(event) {
    const { data } = event;
    if(!data) return;
    if(!data.action) return;
    switch(data.action) {
        case 'generateLUT':
            if(!data.palette || !data.comparison) return;
            renderImage(data.palette, data.comparison);
            break;
        default:
            break;
    }
}

async function renderImage(palette, comparison) {
    const width = originalCanvas.width;
    const height = originalCanvas.height;
    renderCanvas.width = width;
    renderCanvas.height = height;

    let renderCtx = renderCanvas.getContext('2d');

    renderCtx.clearRect(0, 0, width, height);
    renderCtx.drawImage(originalCanvas, 0, 0, width, height);

    await pixelArtRendering(renderCanvas, palette, comparison);
    postMessage({
        action: 'setLUT',
        bitmap: renderCtx.getImageData(0, 0, width, height)
    });
}

export async function pixelArtRendering(canvas, paletteID, comparisonID) {
    const palette = config.palettes.flatMap(g => g.palettes)
        .find(pal => pal.id === paletteID);
    const comparison = config.colour_comparison
        .find(comp => comp.id === comparisonID);
    const algorithm = config.colouring_algorithms.flatMap(g => g.algorithms)
        .find(alg => alg.id === "nearest");

    await applyShader(
        canvas, {
        palette: palette,
        algorithm: algorithm,
        comparison: comparison,
        errFac: 0
    });
}

function generateBlankLUT() {
    const factor = Math.sqrt(constants.lut.depth);
    const width = constants.lut.depth * factor;
    const height = constants.lut.depth * factor;
    originalCanvas.width = width;
    originalCanvas.height = height;
    const ctx = originalCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let z = 0; z < constants.lut.depth; z++) {
        for (let y = 0; y < constants.lut.depth; y++) {
            for (let x = 0; x < constants.lut.depth; x++) {
                const coords = getLUTCoords(x, y, z);
                const index = (coords.y * width + coords.x) * 4;
                imageData.data[index] = x;
                imageData.data[index + 1] = y;
                imageData.data[index + 2] = z;
                imageData.data[index + 3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
