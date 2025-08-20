#version 300 es

in vec2 aPosition;
out vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);

    vTexCoord = aPosition * 0.5 + 0.5; // Transform from [-1, 1] to [0, 1]
    vTexCoord.y = 1.0 - vTexCoord.y; // Flip Y coordinate for WebGL texture coordinates
}
