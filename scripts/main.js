import { init, renderer } from './init.js';
import { config, constants } from './constants.js';
import { shader_attribute_id } from './utils.js';

// Initialise the interface based on the config
let success = await init();
if (!success) {
    console.error('Failed to initialise the interface.');
}

let canvasSizes = []
let parallelMessages = 0;
renderer.onmessage = function(event) {
    while(parallelMessages > 0) {

    }
    parallelMessages++;

    const { data } = event;
    if (!data) return;
    if (!data.action) return;

    switch (data.action) {
        case 'setCanvasImage':
            if(!data.canvas || !data.bitmap) return;
            drawImageToCanvas(data.bitmap, data.canvas);
            break;
        case 'setCanvasSize':
            if(!data.canvas || !data.width || !data.height) return;
            const canvas = document.getElementById(data.canvas);
            canvasSizes[canvas] = {
                width: data.width,
                height: data.height
            };
            break;
        case 'getPreferences':
            renderer.postMessage({
                action: "setPreferences",
                preferences: getPreferences()
            });
            break;
        default:
            console.error('Unknown action:', data.action);
    }

    parallelMessages--;
}

export function getPreferences() {
    let intermediateShaders = [];

    config.intermediate_shaders.forEach((shader) => {
        let args = [];
        shader.shader_arguments.forEach((arg) => {
            const id = shader_attribute_id(shader.id, arg.id);
            const value = document.getElementById(id).value;
            args.push({
                id: arg.id,
                value: value
            });
        });
        const shaderObj = {
            id: shader.id,
            arguments: args
        }
        intermediateShaders.push(shaderObj);
    });

    const preferences = {
        renderWidth: Math.round(parseFloat(
            document.getElementById(constants.ids.width_px).value
        )),
        renderHeight: Math.round(parseFloat(
            document.getElementById(constants.ids.height_px).value
        )),
        palette: document.getElementById(constants.ids.palettes).value,
        algorithm: document.getElementById(constants.ids.colouring_algorithm).value,
        comparison: document.getElementById(constants.ids.colour_comparison).value,
        error_factor: parseFloat(
            document.getElementById(constants.ids.error_factor).value
        ),
        intermediateShaders: intermediateShaders,
    };
    return preferences;
}
function drawImageToCanvas(bitmap, canvas) {
    canvas = document.getElementById(canvas)
    requestAnimationFrame(() => {
        updateCanvasSize(canvas);
        canvas
            .getContext('2d')
            .putImageData(bitmap, 0, 0);
    });
}
function updateCanvasSize(canvas) {
    if(canvas in canvasSizes) {
        const dim = canvasSizes[canvas];
        canvas.width = dim.width;
        canvas.height = dim.height;
    }
}
