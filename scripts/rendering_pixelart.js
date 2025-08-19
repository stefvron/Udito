import { constants, config } from './constants.js';
import { compileShader, linkProgram, shader_attribute_id, runShaderProgram } from './utils.js';

export async function pixelArtRendering(canvas, preferences) {
    const palette = config.palettes.flatMap(g => g.palettes)
        .find(pal => pal.id === preferences.palette);
    const algorithm = config.colouring_algorithms.flatMap(g => g.algorithms)
        .find(alg => alg.id === preferences.algorithm);
    const comparison = config.colour_comparison
        .find(comp => comp.id === preferences.comparison);
    const errFac = preferences.error_factor;

    if(algorithm.type == "shader") {
        await applyShader(
            canvas, {
            palette: palette,
            algorithm: algorithm,
            comparison: comparison,
            errFac: errFac
        });
    } else {
        applyFunction(
            canvas, {
            palette: palette,
            algorithm: algorithm,
            comparison: comparison,
            errFac: errFac
        });
    }
}

async function applyShader(canvas, args) {
    let renderCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const gl = renderCanvas.getContext('webgl2', {
        antialias: false,
        depth: false,
    });
    if (!gl) {
        console.error('WebGL context not available.');
        return;
    }
    let shaders = [];
    const vertShader = await compileShader(
        gl,
        constants.shaders.directory + constants.shaders.vertex_shader,
        gl.VERTEX_SHADER
    );
    if(vertShader) shaders.push(vertShader);
    else {
        console.error('Failed to compile vertex shader.');
        return;
    }
    const shaderPath = constants.shaders.directory + args.algorithm.shader_name;
    const compPath = constants.shaders.directory + args.comparison.shader_name;
    const compiledShader = await compileShader(
        gl,
        shaderPath,
        gl.FRAGMENT_SHADER,
        compPath
    );
    if (compiledShader) shaders.push(compiledShader);

    const program = linkProgram(gl, shaders);
    if (!program) {
        console.error('Failed to link shaders into a program.');
        return;
    }
    gl.useProgram(program);

    if(args.algorithm.shader_uniforms) args.algorithm.shader_uniforms
        .forEach(arg => {
        const id = arg.name;
        const value = arg.value;
        const location = gl.getUniformLocation(program, id);
        if (location) {
            const type = arg.type;
            switch (type) {
                case 'int':
                    gl.uniform1i(location, parseInt(value, 10));
                    break;
                case 'texture2d':
                    const texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    const size = Math.sqrt(value.length());
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.Luminance, size, size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, value);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.uniform1i(gl.getUniformLocation(program, id), 2);
                    break;
                default:
                    console.warn(`Unknown uniform type for ${id}: ${type}`);
            }
        } else {
            console.warn(`Uniform location for ${id} not found.`);
        }
    });

    if(args.algorithm.has_error) {
        const errFacLoc = gl.getUniformLocation(program, 'errorFactor');
        if (errFacLoc) {
            gl.uniform1f(errFacLoc, args.errFac);
        } else {
            console.warn('Uniform location for errorFactor not found.');
        }
    }

    passPalette(gl, program, args.palette);

    await runShaderProgram(canvas, renderCanvas, gl, program);
}
function applyFunction(canvas, args) {

}

function passPalette(gl, program, palette) {
   const pal = arrayFromPalette(palette);
    const paletteTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
    const size = palette.colours.length;
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, size, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, pal
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'palette'), 1);

    gl.uniform1i(gl.getUniformLocation(program, 'palLen'), size);
}

function arrayFromPalette(palette) {
    const arr = new Uint8Array(palette.colours.length * 4);
    let index = 0;
    palette.colours.forEach((colour) => {
        const i = index * 4;
        arr[i] = parseInt(colour.slice(0,2), 16);
        arr[i + 1] = parseInt(colour.slice(2,4), 16);
        arr[i + 2] = parseInt(colour.slice(4,6), 16);
        if(colour.length === 8) {
            arr[i + 3] = parseInt(colour.slice(6,8), 16);
        } else arr[i + 3] = 255; // Default alpha if not provided
        index++;
    });
    return arr;
}
