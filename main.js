// Input elements
const palIn = document.getElementById("pal");
const algIn = document.getElementById("alg");

const errfacIn = document.getElementById("errfac");
const satIn = document.getElementById("sat");
const briIn = document.getElementById("bri");
const contIn = document.getElementById("cont");
const blurIn = document.getElementById("blur");
const alp = document.getElementById("alp");
const modAlp = document.getElementById("modAlp");

const xpercIn = document.getElementById("xperc");
const ypercIn = document.getElementById("yperc");
const lockRatio = document.getElementById("lockRatio")
const xabsIn = document.getElementById("xabs");
const yabsIn = document.getElementById("yabs");

const uploadIn = document.getElementById("uploadSource");
const downloadIn = document.getElementById("downloadResult");
const downloadGridIn = document.getElementById("downloadResultGrid");

// Output Elements
const unmodImg = document.getElementById("unmod");
const sourceImg = document.getElementById("source");
const previewImg = document.getElementById("preview");
const info = document.getElementById("info");

// Dictionaries
const palettes = {
    "ed": ["000000", "1D2B53", "7E2553", "5F574F", "AB5236", "008751", "83769C", "FF004D", "FF77A8", "29ADFF", "FFA300", "C2C3C7", "00E436", "FFCCAA", "FFEC27", "FFF1E8"],
    "edws": ["000000", "1D2B53", "7E2553", "5F574F", "AB5236", "008751", "83769C", "FF004D", "FF77A8", "29ADFF", "FFA300", "C2C3C7", "00E436", "FFCCAA", "FFEC27", "FFF1E8", "291814", "111D35", "422136", "49333B", "742F29", "125359", "754665", "065AB5", "BE1250", "A28879", "FF6C24", "FF6E59", "00B543", "FF9D81", "A8E72E", "F3EF7D"],
    "gb": ["000","101","210","311"],
    "rp23": ["ff4500","ffa800","ffd635","00a368","7eed56","2450a4","3690ea","51e9f4","811e9f","b44ac0","ff99aa","9c6926","000000","898d90","ffffff"],
    "rp22": ["6d001a","be0039","ff4500","ffa800","ffd635","fff8b8","00a368","00cc78","7eed56","00756f","009eaa","00ccc0","2450a4","3690ea","51e9f4","493ac1","6a5cff","94b3ff","811e9f","b44ac0","e4abff","de107f","ff3881","ff99aa","6d482f","9c6926","ffb470","000000","515252","898d90","d4d7d9","ffffff"],
    "rp17": ["FFFFFF","E4E4E4","888888","222222","FFA7D1","E50000","E59500","A06A42","E5D900","94E044","02BE01","00D3DD","0083C7","0000EA","CF6EE4","820080"],
    "bw": (x) => {
        const c = Math.round((x[0]+x[1]+x[2])/3);
        return [c,c,c]
    },
    "6b": (x) => {
        return [Math.floor(x[0]/255*3+0.5)/3*255,Math.floor(x[1]/255*3+0.5)/3*255,Math.floor(x[2]/255*3+0.5)/3*255]
    },
    "3b": (x) => {
        return [Math.floor(x[0]/255 + 0.5)*255,Math.floor(x[1]/255 + 0.5)*255,Math.floor(x[2]/255 + 0.5)*255]
    },
    "1b": (x) => {
        const c = Math.floor((x[0]+x[1]+x[2])/3/255 + 0.5) * 255;
        return [c,c,c]
    },
    "p8":  null,
    "p8ws": null,
    "upload": null
}
const palLengths = {
    "bw": 255,
    "6b": 1,
    "3b": 1,
    "1b": 1
}
const algorithms = {
    "nc": nearestColour,
    "fs": floydSteinberg,
    "bm4": bayerMatrix4,
    "bm8": bayerMatrix8,
}

// Logic
function dl() {
    const data = previewImg.toDataURL("image/png");
    const newWin = window.open();
    const wRh = Math.ceil(previewImg.width/previewImg.height * 100);
    newWin.document.write("<img src='" + data + "' style='width: 100%; max-width: " + wRh + "vh; height: auto; image-rendering: pixelated;'>");
    newWin.document.write("<a id='img' href='" + data + "' download='udito_image.png'></a>");
    newWin.document.body.style.margin = "0";
    newWin.document.getElementById("img").click();
}
function dlGrid() {
    const fac = 20;

    const can = document.createElement("canvas");
    can.width = previewImg.width * (fac+1) - 1;
    can.height = previewImg.height * (fac+1) - 1;

    const pctx = previewImg.getContext("2d");
    const imageData = pctx.getImageData(0, 0, previewImg.width, previewImg.height);
    const data = imageData.data;

    const ctx = can.getContext("2d");
    ctx.fillStyle = "gray";
    ctx.fillRect(0,0, can.width, can.height);
    const cImageData = ctx.getImageData(0, 0, can.width, can.height);
    const cData = cImageData.data;

    for(x = 0; x < previewImg.width; x++) {
        for(y = 0; y < previewImg.height; y++) {
            const i = y * (imageData.width * 4) + x * 4;
            for(xt = 0; xt < fac; xt++) {
                for(yt = 0; yt < fac; yt++) {
                    const j = ((y * cImageData.width + x)*(fac+1) + xt + (yt * cImageData.width))*4;

                    cData[j] = data[i]; // red
                    cData[j + 1] = data[i + 1]; // green
                    cData[j + 2] = data[i + 2]; // blue
                }
            }
        }
    }

    ctx.putImageData(cImageData, 0, 0);

    const dData = can.toDataURL("image/png");
    const newWin = window.open();
    const wRh = Math.ceil(previewImg.width/previewImg.height * 100);
    newWin.document.write("<img src='" + dData + "' style='width: 100%; max-width: " + wRh + "vh; height: auto; image-rendering: pixelated;'>");
    newWin.document.write("<a id='img' href='" + dData + "' download='udito_image_grid.png'></a>");
    newWin.document.body.style.margin = "0";
    newWin.document.getElementById("img").click();
}

function updatePreview(resized) {
    if(modAlp.checked) {
        alp.disabled = false;
    } else {
        alp.disabled = true;
    }
    errfacIn.disabled = algIn.value == "nc";
    resized = resized || false;
    generatePreview(resized)
}

function updateSize(str) {
    switch(str) {
        case "xp":
        case "lock":
            xabsIn.value = Math.round(unmodImg.width * xpercIn.value / 100);
            if(lockRatio.checked) {
                ypercIn.disabled = true;
                ypercIn.value = xpercIn.value;
                yabsIn.value = Math.round(unmodImg.height * ypercIn.value / 100);
            }
            else ypercIn.disabled = false;
            break;
        case "yp":
            yabsIn.value = Math.round(unmodImg.height * ypercIn.value / 100);
            break;
        case "xa":
            xpercIn.value = xabsIn.value / unmodImg.width * 100;
            if(lockRatio.checked) {
                ypercIn.value = xpercIn.value;
                yabsIn.value = Math.round(unmodImg.height * ypercIn.value / 100);
            }
            break;
        case "ya":
            ypercIn.value = yabsIn.value / unmodImg.height * 100;
            if(lockRatio.checked) {
                xpercIn.value = ypercIn.value;
                xabsIn.value = Math.round(unmodImg.width * xpercIn.value / 100);
            }
            break;
    }
}

function resetSliders() {
    errfacIn.value = 1;
    satIn.value = 1;
    briIn.value = 1;
    alp.value = 0.33
    alp.disabled = true;
    modAlp.checked = false;
    errfacIn.disabled = algIn.value == "nc";
}

function uploadImage() {
    resetSliders();
    var img = new Image();
    var fr = new FileReader();
    fr.onload = () => {
        img.src = fr.result;
        img.onload = () => {
            xpercIn.value = 100;
            ypercIn.value = 100;
            xabsIn.max = img.width * 100;
            xabsIn.value = img.width;
            yabsIn.max = img.height * 100;
            yabsIn.value = img.height;
        };
    };
    fr.readAsDataURL(uploadIn.files[0]);
    generatePreview(false);
}

function generatePreview(resized=false) {
    resized = resized || false;
    var img = new Image();
    var fr = new FileReader();
    fr.onload = () => {
        img.src = fr.result;
        img.onload = () => {
            unmodImg.width = img.width;
            unmodImg.height = img.height;
            const Uctx = unmodImg.getContext("2d");
            Uctx.drawImage(img, 0, 0)
            
            sourceImg.width = xabsIn.value;
            sourceImg.height = yabsIn.value;
            const Sctx = sourceImg.getContext("2d");
            Sctx.drawImage(img, 0, 0, xabsIn.value, yabsIn.value);

            previewImg.width = xabsIn.value;
            previewImg.height = yabsIn.value;
            const ctx = previewImg.getContext("2d");
            ctx.drawImage(img, 0, 0, xabsIn.value, yabsIn.value);

            info.innerHTML = 'Preview was not loaded automatically, because the dimensions are larger than advised. Press "Resize" once to load the preview manually.';

            applySettings();
            if(xabsIn.value * yabsIn.value < 500_000 || resized) {
                algorithms[algIn.value](palettes[palIn.value]);
                info.innerHTML = "";
            }
        };
    };
    fr.readAsDataURL(uploadIn.files[0]);
}

function applySettings() {
    const Sctx = sourceImg.getContext("2d");
    const imageData = Sctx.getImageData(0, 0, previewImg.width, previewImg.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            const oldpixel = [data[i],data[i+1],data[i+2]]
            var hsv = RGBtoHSV(oldpixel);
            hsv[1] = hsv[1] * satIn.value; //Math.min(1, hsv[1] * satIn.value)
            hsv[2] = hsv[2] * briIn.value; //Math.min(1, hsv[2] * briIn.value)
            newpixel = HSVtoRGB(hsv);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue
            if(modAlp.checked) {
                if(data[i+3] <= alp.value * 255) {
                    data[i+3] = 0;
                } else {
                    data[i+3] = 255;
                }
            }
        }
    }

    Sctx.putImageData(imageData, 0, 0);
}

function getColourAt(x, y) {
    const ctx = previewImg.getContext("2d");
    const data = ctx.getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
}
function setColourAt(colour, x, y) {
    const ctx = previewImg.getContext("2d");
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    for(i = 0; i < colour.length; i++) data[i] = colour[i];
    ctx.putImageData(imageData, x, y);
}

function rgbToLab(rgb) {
    for(i = 0; i < 3; i++) {
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

    const l = 116 * formula(y/0.9504) - 16;
    const a = 500 * (formula(x/1) - formula(y/0.9504));
    const b = 200 * (formula(y/0.9504) - formula(z/1.0888));
    
    return [l,a,b];
}

function deltaE(lab1, lab2) {
    return Math.sqrt(Math.pow(lab2[0]-lab1[0],2)+Math.pow(lab2[1]-lab1[1],2)+Math.pow(lab2[2]-lab1[2],2))
}

function hexToRgb(str) { 
    str = str.length == 3 ? str.replace(/(.)/g, '$1$1') : str;
    var rgb = parseInt(str, 16);               
    return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255]
}
function RGBtoHSV(rgb) {
    const r = Math.min(1,rgb[0]/255);
    const g = Math.min(1,rgb[1]/255);
    const b = Math.min(1,rgb[2]/255);
    const cmax = Math.max(r,g,b);
    const cmin = Math.min(r,g,b);
    const delta = cmax-cmin;

    var h = 0;
    if(delta == 0) h = 0;
    else if(cmax == r) h = 60*(((g-b)/delta) % 6);
    else if(cmax == g) h = 60*(((b-r)/delta) + 2);
    else h = 60*(((r-g)/delta) + 4)
    if(h < 0) h += 360;

    var s = 0;
    if(cmax != 0) s = delta/cmax;
    var v = cmax;

    return [h,s,v];
}
function HSVtoRGB(hsv) {
    const h = hsv[0]; //Math.min(360,hsv[0]);
    const s = hsv[1]; //Math.min(1,hsv[1]);
    const v = hsv[2]; //Math.min(1,hsv[2]);
    const c = v*s;
    const x = c * (1 - Math.abs(((h/60) % 2) - 1))
    const m = v-c;

    var rd, gd, bd = 0;
    if(h >= 0 && h < 60) rd=c, gd=x, bd=0;
    else if(h >= 60 && h < 120) rd=x, gd=c, bd=0;
    else if(h >= 120 && h < 180) rd=0, gd=c, bd=x;
    else if(h >= 180 && h < 240) rd=0, gd=x, bd=c;
    else if(h >= 240 && h < 300) rd=x, gd=0, bd=c;
    else if(h >= 300 && h <= 360) rd=c, gd=0, bd=x;

    return [(rd+m)*255, (gd+m)*255, (bd+m)*255];
}

function getPaletteLength(palette) {
    if(palette instanceof Array) {
        return palette.length;
    } else if(palette instanceof Function){
        return palLengths[Object.entries(palettes).find(([k,v]) => v === palette)?.[0]] ?? 0;
    }
}

function getNearestColourFromPalette(colour, palette) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const cAsLab = rgbToLab(colour);
            var closest = hexToRgb(palette[0]);
            var delta = deltaE(cAsLab,rgbToLab([...closest]));
            var i = 1;
            while(i < palette.length) {
                const rgb = hexToRgb(palette[i]);
                const deltaI = deltaE(cAsLab,rgbToLab([...rgb]));
                if(deltaI < delta) {
                    closest = rgb;
                    delta = deltaI;
                }
                i++;
            }
            resolve(closest);
        }, 0);
    });
}
function getNearestColourFromPaletteSync(colour, palette) {
    if(palette instanceof Array) {
        const cAsLab = rgbToLab(colour);
        var closest = hexToRgb(palette[0]);
        var delta = deltaE(cAsLab,rgbToLab([...closest]));
        var i = 1;
        while(i < palette.length) {
            const rgb = hexToRgb(palette[i]);
            const deltaI = deltaE(cAsLab,rgbToLab([...rgb]));
            if(deltaI < delta) {
                closest = rgb;
                delta = deltaI;
            }
            i++;
        }
        return closest;
    } else if(palette instanceof Function){
        return palette(colour);
    }
}

// Colour matching algorithms
function nearestColour(pal) {
    const ctx = previewImg.getContext("2d");
    const Sctx = sourceImg.getContext("2d");
    const imageData = Sctx.getImageData(0, 0, previewImg.width, previewImg.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            const oldpixel = [data[i],data[i+1],data[i+2]]
            newpixel = getNearestColourFromPaletteSync([...oldpixel], pal);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function floydSteinberg(pal) {
    const ctx = previewImg.getContext("2d");
    const Sctx = sourceImg.getContext("2d");
    const imageData = Sctx.getImageData(0, 0, previewImg.width, previewImg.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            const oldpixel = [data[i],data[i+1],data[i+2]]
            newpixel = getNearestColourFromPaletteSync([...oldpixel], pal);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue

            const quantError = [(oldpixel[0] - newpixel[0]), (oldpixel[1] - newpixel[1]), (oldpixel[2] - newpixel[2])];
            
            const offsets = [[1,0],[-1,1],[0,1],[1,1]];
            const fact = [(7/16),(3/16),(5/16),(1/16)];
            for(let o = 0; o < offsets.length; o++) {
                const c = (y+offsets[o][1]) * (imageData.width * 4) + (x+offsets[o][0])  * 4;
                data[c] += (quantError[0] * fact[o] * errfacIn.value); // red
                data[c + 1] += (quantError[1] * fact[o] * errfacIn.value); // green
                data[c + 2] += (quantError[2] * fact[o] * errfacIn.value); // blue
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function bayerMatrix4(pal) {
    let m = [
        [0, 12, 3, 15], 
        [8, 4, 11, 7], 
        [2, 14, 1, 13], 
        [10, 6, 9, 5]
    ];
    m = m.map(x => x.map(y => y/16));
    bayerMatrix(pal,m);
}
function bayerMatrix8(pal) {
    let m = [
        [0, 48, 12, 60, 3, 51, 15, 63], 
        [32, 16, 44, 28, 35, 19, 47, 31],
        [8, 56, 4, 52, 11, 59, 7, 55],
        [40, 24, 36, 20, 43, 27, 39, 23],
        [2, 50, 14, 62, 1, 49, 13, 61], 
        [34, 18, 46, 30, 33, 17, 45, 29],
        [10, 58, 6, 54, 9, 57, 5, 53],
        [42, 26, 38, 22, 41, 25, 37, 21]
    ];
    m = m.map(x => x.map(y => y/64));
    bayerMatrix(pal,m);
}

function bayerMatrix(pal, matrix) {
    console.log(pal)
    console.log(getPaletteLength(pal))
    let RATIO = 255/Math.log2((getPaletteLength(pal))/3)*errfacIn.value
    console.log(RATIO)

    const ctx = previewImg.getContext("2d");
    const Sctx = sourceImg.getContext("2d");
    const imageData = Sctx.getImageData(0, 0, previewImg.width, previewImg.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            let oldpixel = [data[i],data[i+1],data[i+2]]
            oldpixel = oldpixel.map(c => Math.min(255, c + RATIO*(matrix[x%matrix.length][y%matrix[0].length] - 0.5)));
            newpixel = getNearestColourFromPaletteSync([...oldpixel], pal);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue
        }
    }

    ctx.putImageData(imageData, 0, 0);
}