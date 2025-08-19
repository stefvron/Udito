#version 300 es
precision highp float;
uniform sampler2D inputTexture;
uniform float saturation;
uniform float brightness;
uniform float contrast;
uniform int bblur;
uniform int alpha;

in vec2 vTexCoord;
out vec4 fragColor;
void main() {
    vec4 color = texture(inputTexture, vTexCoord);

    // Apply box blur if enabled
    if (bblur > 0) {
        // TODO
    }

    // Adjust brightness
    color.rgb *= brightness;

    // Adjust contrast
    color.rgb = (color.rgb - 0.5) * contrast + 0.5;

    // Adjust saturation
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);

    // Alpha threhold
    if(alpha >= 0) {
        if (color.a < float(alpha) / 255.0) {
            discard; // Discard pixels below the alpha threshold
        } else {
            color.a = 1.0; // Set alpha to 1.0 if alpha is negative
        }
    }


    fragColor = color;
}
