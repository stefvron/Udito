import { rgbToLab } from './common.js';

export default function cDist(c1, c2) {
    let lab1 = rgbToLab(c1);
    let lab2 = rgbToLab(c2);
    return Math.sqrt(
        Math.pow(lab2[0]-lab1[0],2) +
        Math.pow(lab2[1]-lab1[1],2) +
        Math.pow(lab2[2]-lab1[2],2)
    );
}
