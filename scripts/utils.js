import { constants } from './constants.js';

export function shader_attribute_id(shader_id, attribute_id) {
    return `${shader_id}_${attribute_id}`;
}
export async function compileShader(gl, shaderSource, shaderType, appendSource = "") {
    let resp = await fetch(shaderSource);
    if (!resp.ok) {
        console.error('Failed to fetch shader source:', resp.statusText);
        return null;
    }
    shaderSource = await resp.text();
    if(appendSource != "") {
        resp = await fetch(appendSource);
        if (!resp.ok) {
            console.error('Failed to fetch shader source:', resp.statusText);
            return null;
        }
        shaderSource += await resp.text();
    }

    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
export function linkProgram(gl, shaderList) {
    const program = gl.createProgram();

    shaderList.forEach(shader => {
        gl.attachShader(program, shader);
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

export async function runShaderProgram(imageSourceCanvas, renderCanvas, gl, program) {
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fullScreenQuad, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'aPosition');
    if (posLoc === -1) {
        console.error('Attribute location for aPosition not found.');
        return;
    }

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, imageSourceCanvas.width, imageSourceCanvas.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, imageSourceCanvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'inputTexture'), 0);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    imageSourceCanvas.getContext('2d').drawImage(renderCanvas, 0, 0);
}

const fullScreenQuad = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
    1.0, -1.0,
    1.0,  1.0
]);

export async function applyShader(canvas, args) {
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
    else console.error('Failed to compile fragment shader.');

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
                    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    const size = Math.sqrt(value.length);
                    const matrix = new Uint8Array(value);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size, size, 0, gl.RED, gl.UNSIGNED_BYTE, matrix);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

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
export function hexToRgb(hex) {
    let result = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
    ];
    if (hex.length === 8) {
        result.push(parseInt(hex.slice(6, 8), 16)); // Add alpha if present
    }
    return result;
}

export function getLUTCoords(r, g, b) {
    const factor = Math.sqrt(constants.lut.depth);

    const zX = b % factor;
    const zY = Math.floor(b / factor);
    const pixelX = Math.floor(r + zX * constants.lut.depth);
    const pixelY = Math.floor(g + zY * constants.lut.depth);

    return { x: pixelX, y: pixelY };
}
