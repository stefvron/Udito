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
