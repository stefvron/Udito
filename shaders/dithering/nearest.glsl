#version 300 es
precision highp float;
uniform sampler2D inputTexture;
uniform sampler2D palette;
uniform int palLen;

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

void main() {
    vec4 colour = texture(inputTexture, vTexCoord);

    // Find the nearest colour in the palette
    colour = nearestColour(colour);

    // Output the final colour
    fragColour = colour;
}
