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
vec3 labToLch(vec3 lab) {
    // Convert Lab to LCh
    float c = sqrt(lab.y * lab.y + lab.z * lab.z);
    float h = atan(lab.z, lab.y);
    return vec3(lab.x, c, h);
}

float cDist(vec4 c1, vec4 c2) {
    vec3 lab1 = srgbTolab(c1);
    vec3 lab2 = srgbTolab(c2);

    vec3 lch1 = labToLch(lab1);
    vec3 lch2 = labToLch(lab2);

    float kL = 1.0;
    float kC = 1.0;
    float kH = 1.0;

    float deltaL = lch2.x - lch1.x;
    float deltaC = lch2.y - lch1.y;
    
    float deltah = lch2.z - lch1.z;
    if (lch1.y == 0.0 || lch2.y == 0.0) {
        deltah = 0.0;
    } else if (abs(lch1.z - lch2.z) > 180.0 && lch2.z <= lch1.z) {
        deltah += 360.0;
    } else if (abs(lch1.z - lch2.z) > 180.0 && lch2.z > lch1.z) {
        deltah -= 360.0;
    }

    float deltaH = 2.0 * sqrt(lch1.y * lch2.y) * sin(deltah / 2.0);

    float L_ = (lch1.x + lch2.x) / 2.0;
    float C_ = (lch1.y + lch2.y) / 2.0;

    float H_;
    if (lch1.y == 0.0 || lch2.y == 0.0) {
        H_ = lch1.z + lch2.z;
    } else if (abs(lch1.z - lch2.z) <= 180.0) {
        H_ = (lch1.z + lch2.z) / 2.0;
    } else if ((lch1.z + lch2.z) < 360.0) {
        H_ = (lch1.z + lch2.z + 360.0) / 2.0;
    } else {
        H_ = (lch1.z + lch2.z - 360.0) / 2.0;
    }

    float t = 1.0
        - 0.17 * cos(H_ - 30.0)
        + 0.24 * cos(2.0 * H_)
        + 0.32 * cos(3.0 * H_ + 6.0)
        - 0.20 * cos(4.0 * H_ - 63.0);

    float sL = 1.0 + (0.015 * pow(L_ - 50.0, 2.0)) / sqrt(20.0 + pow(L_ - 50.0, 2.0));
    float sC = 1.0 + 0.045 * C_;
    float sH = 1.0 + 0.015 * C_ * t;

    float deltaTheta = 60.0 * exp(-pow((H_ - 275.0) / 25.0, 2.0));
    float rC = pow(C_, 7.0) / (pow(C_, 7.0) + pow(25.0, 7.0));
    float rT = -2.0 * sqrt(rC) * sin(deltaTheta);

    float deltaLKlsl = deltaL / (kL * sL);
    float deltaCkcsc = deltaC / (kC * sC);
    float deltaHkhsh = deltaH / (kH * sH);

    return sqrt(
        deltaLKlsl * deltaLKlsl +
        deltaCkcsc * deltaCkcsc +
        deltaHkhsh * deltaHkhsh +
        rT * deltaCkcsc * deltaHkhsh
    );
}
