import { constants, config } from './constants.js';
import { compileShader, linkProgram, shader_attribute_id } from './utils.js';

export async function preprocessRendering(canvas, preferences) {
    let render = new OffscreenCanvas(canvas.width, canvas.height);
    const gl = render.getContext('webgl2', {
        antialias: false,
        depth: false,
    });
    if (!gl) {
        console.error('WebGL context not available.');
        return;
    }
    await Promise.all(
        preferences.intermediateShaders.map(async shader => 
            applyShader(canvas, render, gl, shader)
        )
    );
}

async function applyShader(canvas, renderCanvas, gl, shader) {
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
    const shaderSource = config.intermediate_shaders.find(s => s.id === shader.id);
    if (!shaderSource) {
        console.error(`Shader with id ${shader.id} not found.`);
        return;
    }
    const shaderPath = constants.shaders.directory + shaderSource.shader_name;
    const compiledShader = await compileShader(
        gl,
        shaderPath,
        gl.FRAGMENT_SHADER
    );
    if (compiledShader) shaders.push(compiledShader);

    const program = linkProgram(gl, shaders);
    if (!program) {
        console.error('Failed to link shaders into a program.');
        return;
    }
    gl.useProgram(program);

    shader.arguments.forEach(arg => {
        const id = shader_attribute_id(shader.id, arg.id);
        const value = arg.value;
        const location = gl.getUniformLocation(program, arg.id);
        if (location) {
            const type = config.intermediate_shaders
                .find(s => s.id === shader.id).shader_arguments
                .find(argument => argument.id === arg.id).type;
            switch (type) {
                case 'float':
                    gl.uniform1f(location, parseFloat(value));
                    break;
                case 'int':
                    gl.uniform1i(location, parseInt(value, 10));
                    break;
                default:
                    console.warn(`Unknown uniform type for ${id}: ${type}`);
            }
        } else {
            console.warn(`Uniform location for ${id} not found.`);
        }
    });
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fullScreenQuad, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'aPosition');
    if (posLoc === -1) {
        console.error('Attribute location for aPosition not found.');
        return;
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, canvas
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

    canvas.getContext('2d').drawImage(renderCanvas, 0, 0);
}

const fullScreenQuad = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
    1.0, -1.0,
    1.0,  1.0
]);
