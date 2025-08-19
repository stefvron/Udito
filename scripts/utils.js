export function shader_attribute_id(shader_id, attribute_id) {
    return `${shader_id}_${attribute_id}`;
}
export async function compileShader(gl, shaderSource, shaderType) {
    const resp = await fetch(shaderSource);
    if (!resp.ok) {
        console.error('Failed to fetch shader source:', resp.statusText);
        return null;
    }
    shaderSource = await resp.text();

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
