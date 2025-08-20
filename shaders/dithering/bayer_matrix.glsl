#version 300 es
precision highp float;
uniform sampler2D inputTexture;
uniform sampler2D palette;
uniform int palLen;
uniform float errorFactor;

uniform int divisor;
uniform sampler2D matrix;

in vec2 vTexCoord;
out vec4 fragColour;

float cDist(vec4 c1, vec4 c2);
vec4 nearestColour(vec4 colour) {
    // Sample the palette texture
    vec4 nearest = texture(palette, vec2(0.0)); // Initialize with the first colour
    float minDistance = cDist(colour, nearest);

    // Iterate through the palette to find the nearest colour
    for (int i = 1; i < palLen; i++) {
        vec4 paletteColour = texture(palette, vec2(float(i) / float(palLen), 0.0));
        float distance = cDist(colour, paletteColour);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = paletteColour;
        }
    }

    return nearest;
}

vec4 mapToBayer(vec4 colour) {
    // Map the input value to the Bayer matrix
    float ratio = 255.0 / log2(float(palLen)/3.0) * errorFactor;
    ratio /= 255.0;
    vec2 matSize = vec2(textureSize(matrix, 0));
    vec2 texSize = vec2(textureSize(inputTexture, 0));
    vec2 coord = mod(vTexCoord * texSize, matSize) / matSize;
    float bayerValue = float(texture(matrix, coord).r) * 255.0;
    bayerValue /= float(divisor);
    bayerValue -= 0.5;
    bayerValue *= ratio;
    vec4 col = vec4(colour.rgb + bayerValue, colour.a);
    col = clamp(col, 0.0, 1.0);
    return col;
} 

void main() {
    vec4 colour = texture(inputTexture, vTexCoord);

    colour = mapToBayer(colour);

    // Find the nearest colour in the palette
    colour = nearestColour(colour);

    // Output the final colour
    fragColour = colour;
}
