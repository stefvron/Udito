import './common.js';

export default function cDist(c1, c2) {
    let lab1 = rgbToLab(c1);
    let lab2 = rgbToLab(c2);
    return dist(lab1, lab2);
}
