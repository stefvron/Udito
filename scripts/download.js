import { constants } from './constants.js';
export function downloadResult() {
    const previewImg = document.getElementById(constants.ids.rendered_canvas);

    const data = previewImg.toDataURL("image/png");
    const newWin = window.open();
    const wRh = Math.ceil(previewImg.width/previewImg.height * 100);
    newWin.document.write("<img src='" + data + "' style='width: 100%; max-width: " + wRh + "vh; height: auto; image-rendering: pixelated;'>");
    newWin.document.write("<a id='img' href='" + data + "' download='udito_image.png'></a>");
    newWin.document.body.style.margin = "0";
    newWin.document.getElementById("img").click();
}
export function downloadGrid() {
    const previewImg = document.getElementById(constants.ids.rendered_canvas);

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

    for(let x = 0; x < previewImg.width; x++) {
        for(let y = 0; y < previewImg.height; y++) {
            const i = y * (imageData.width * 4) + x * 4;
            for(let xt = 0; xt < fac; xt++) {
                for(let yt = 0; yt < fac; yt++) {
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
