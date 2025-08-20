#version 300 es
precision highp float;
uniform sampler2D inputTexture;
uniform float saturation;
uniform float brightness;
uniform float contrast;
uniform int bblur;
uniform int alpha;

in vec2 vTexCoord;
out vec4 fragColour;
void main() {
    vec4 colour = texture(inputTexture, vTexCoord);

    // Apply box blur if enabled
    if(bblur > 0) {
        vec2 texSize = vec2(textureSize(inputTexture, 0));
        vec2 texel = 1.0 / texSize;

        vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
        for(int x = -bblur; x <= bblur; x++) {
            for(int y = -bblur; y <= bblur; y++) {
                vec2 tempTexCoord = vec2(float(x), float(y)) * texel + vTexCoord;
                tempTexCoord = clamp(tempTexCoord, vec2(0.0), vec2(1.0));
                sum += texture(inputTexture, tempTexCoord);
            }
        }
        int count = (bblur*2 +1);
        count *= count;
        sum /= float(count);
        sum.a = colour.a;
        colour = sum;
    }

    // Adjust contrast
    colour.rgb = (colour.rgb - 0.5) * contrast + 0.5;

    // Adjust brightness
    colour.rgb *= brightness;

    // Adjust saturation
    float gray = dot(colour.rgb, vec3(0.299, 0.587, 0.114));
    colour.rgb = mix(vec3(gray), colour.rgb, saturation);

    // Alpha threhold
    if(alpha >= 0) {
        if (colour.a < float(alpha) / 255.0) {
            discard; // Discard pixels below the alpha threshold
        } else {
            colour.a = 1.0; // Set alpha to 1.0 if alpha is negative
        }
    }

    fragColour = colour;
}
