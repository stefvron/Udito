import { init, renderer } from './init.js';
import { config, constants } from './constants.js';
import { shader_attribute_id } from './utils.js';

// Initialise the interface based on the config
let success = await init();
if (!success) {
    console.error('Failed to initialise the interface.');
}

renderer.onmessage = function(event) {
    const { data } = event;
    if (!data) return;
    if (!data.action) return;

    switch (data.action) {
        case 'setCanvasImage':
            if(!data.canvas || !data.bitmap) return;
            document.getElementById(data.canvas)
                .getContext('2d')
                .putImageData(data.bitmap, 0, 0);
            break;
        case 'setCanvasSize':
            if(!data.canvas || !data.width || !data.height) return;
            const canvas = document.getElementById(data.canvas);
            canvas.width = data.width;
            canvas.height = data.height;
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
