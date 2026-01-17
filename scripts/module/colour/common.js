export function degToRad(x) {
    return x * (Math.PI / 180);
}
export function rgbToLab(rgb) {
    rgb = rgb.slice();

    for(let i = 0; i < 3; i++) {
        rgb[i] /= 255;
        if(rgb[i] <= 0.04045) rgb[i] /= 12.92
        else rgb[i] = Math.pow((rgb[i] + 0.055) / 1.055, 2.4)
    }

    var x = 0.4124564 * rgb[0] + 0.3575761 * rgb[1] + 0.1804375 * rgb[2];
    var y = 0.2126729 * rgb[0] + 0.7151522 * rgb[1] + 0.0721750 * rgb[2];
    var z = 0.0193339 * rgb[0] + 0.1191920 * rgb[1] + 0.9503041 * rgb[2];

    const formula = (c) => {
        if(c > Math.pow(6/29, 3)) return Math.pow(c, 1/3);
        return 1/3 * Math.pow(29/6, 2) * c + 4/29;
    }

    const l = 116 * formula(y/1) - 16;
    const a = 500 * (formula(x/0.9504) - formula(y/1));
    const b = 200 * (formula(y/1) - formula(z/1.0888));
    
    return [l,a,b];
}
export function labToLch(lab) {
    let l = lab[0];
    let c = Math.sqrt(Math.pow(lab[1], 2) + Math.pow(lab[2], 2))
    let h = radToDeg(Math.atan2(lab[2], lab[1]));
    if(h < 0) h += 360;
    return [l, c, h];
}

export function radToDeg(x) {
    return x * (180 / Math.PI);
}

