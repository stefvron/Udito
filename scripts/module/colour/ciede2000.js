import { labToLch, degToRad, rgbToLab } from './common.js';

export default function cDist(c1, c2) {
    let lch1 = labToLch(rgbToLab(c1));
    let lch2 = labToLch(rgbToLab(c2));

    let kL = 1;
    let kC = 1;
    let kH = 1;

    let deltaL = lch2[0] - lch1[0];
    let deltaC = lch2[1] - lch1[1];
    let deltah = lch2[2]-lch1[2];
    if(lch1[1] == 0 || lch2[1] == 0) deltah = 0;
    else if(Math.abs(lch1[2]-lch2[2]) > 180 && lch2[2] <= lch1[2]) deltah += 360 ;
    else if(Math.abs(lch1[2]-lch2[2]) > 180 && lch2[2] > lch1[2]) deltah -= 360;
    let deltaH = 2 * Math.sqrt(lch1[1]*lch2[1])*Math.sin(degToRad(deltah/2));

    let L_ = (lch1[0]+lch2[0])/2;
    let C_ = (lch1[1]+lch2[1])/2;
    let H_ = 0;
    if(lch1[1] == 0 || lch2[1] == 0) H_ = lch1[1] + lch2[1];
    else if(Math.abs(lch1[2]-lch2[2]) <= 180) H_ = (lch1[2]+lch2[2])/2;
    else if(Math.abs(lch1[2]-lch2[2]) > 180 && (lch1[2] + lch2[2]) < 360) H_ = (lch1[2]+lch2[2]+360)/2;
    else if(Math.abs(lch1[2]-lch2[2]) > 180 && (lch1[2] + lch2[2]) >= 360) H_ = (lch1[2]+lch2[2]-360)/2;

    let t = 1 - 0.17 * Math.cos(degToRad(H_-30)) + 0.25 * Math.cos(degToRad(2*H_)) + 0.32 * Math.cos(degToRad(3*H_+6)) - 0.2 * Math.cos(degToRad(4*H_-63));

    let sL = 1 + (0.015*Math.pow(L_-50,2))/Math.sqrt(20+Math.pow(L_-50,2));
    let sC = 1 + 0.045 * C_;
    let sH = 1 + 0.015*C_*t;

    let rT = -2 * Math.sqrt(Math.pow(C_,7)/(Math.pow(C_,7)+Math.pow(25,7)))*Math.sin(degToRad(60)*Math.exp(-1*Math.pow((H_-275)/25,2)));

    return Math.sqrt(Math.pow(deltaL/(kL*sL),2)+Math.pow(deltaC/(kC*sC),2)+Math.pow(deltaH/(kH*sH),2)+rT*(deltaC/(kC*sC)*(deltaH/(kH*sH))));
}
