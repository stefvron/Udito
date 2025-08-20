import { constants, config } from './constants.js';
import { compileShader, linkProgram, shader_attribute_id, runShaderProgram } from './utils.js';

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
        ));
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

    await runShaderProgram(canvas, renderCanvas, gl, program);
}
