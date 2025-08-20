float formula(float c) {
    if(c > pow(29.0/6.0, 3.0))
        return pow(c, 1.0/3.0);
    else
        return 1.0/3.0 * pow(29.0/6.0, 2.0) * c + 4.0/29.0;
}

float gammaCorrection(float c) {
    c /= 255.0;
    if (c <= 0.0031308) {
        return 12.92 * c;
    } else {
        return 1.055 * pow(c, 1.0 / 2.4) - 0.055;
    }
}

vec3 srgbTolab(vec4 colour) {
    // Convert sRGB to linear RGB
    colour.r = gammaCorrection(colour.r);
    colour.g = gammaCorrection(colour.g);
    colour.b = gammaCorrection(colour.b);

    float x = colour.r * 0.4124564 + colour.g * 0.3575761 + colour.b * 0.1804375;
    float y = colour.r * 0.2126729 + colour.g * 0.7151522 + colour.b * 0.0721750;
    float z = colour.r * 0.0193339 + colour.g * 0.1191920 + colour.b * 0.9503041;

    float l = 116.0 * formula(y / 0.9504) - 16.0;
    float a = 500.0 * (formula(x / 1.0) - formula(y / 0.9504));
    float b = 200.0 * (formula(y / 0.9504) - formula(z / 1.0888));

    return vec3(l, a, b);
}

float cDist(vec4 c1, vec4 c2) {
    // Calculate the CIE76 distance between two Lab colours
    vec3 lab1 = srgbTolab(c1);
    vec3 lab2 = srgbTolab(c2);
    return length(lab1 - lab2);
}
