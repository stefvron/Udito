import { constants } from "./constants.js";
import { preprocessRendering } from "./rendering_preprocessing.js";
import { pixelArtRendering } from "./rendering_pixelart.js";

const originalCanvas = new OffscreenCanvas(0,0);
const renderCanvas = new OffscreenCanvas(0,0);

onmessage = async function(event) {
    const { data } = event;
    if(!data) return;
    if(!data.action) return;
    switch(data.action) {
        case 'loadImage':
            if(!data.image) return;
            const img = await this.createImageBitmap(data.image);
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            const ctx = originalCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            setAllCanvasSizes(img.width, img.height);
            postMessage({
                action: 'setCanvasImage',
                canvas: constants.ids.original_canvas,
                bitmap: ctx.getImageData(0, 0, img.width, img.height)
            });
            renderImage();
            break;
        case 'renderImage':
            renderImage();
            break;
        default:
    }
}

async function renderImage() {
    const preferences = await getPreferences();

    const width = preferences.renderWidth ?? originalCanvas.width;
    const height = preferences.renderHeight ?? originalCanvas.height;
    setProcessedCanvasSize(width, height);

    const originalCtx = originalCanvas.getContext('2d');
    let renderCtx = renderCanvas.getContext('2d');

    renderCtx.clearRect(0, 0, width, height);
    renderCtx.drawImage(originalCanvas, 0, 0, width, height);

    await preprocessRendering(renderCanvas, preferences);
    postMessage({
        action: 'setCanvasImage',
        canvas: constants.ids.processed_canvas,
        bitmap: renderCtx.getImageData(0, 0, width, height)
    });

    pixelArtRendering(renderCanvas, preferences);
    postMessage({
        action: 'setCanvasImage',
        canvas: constants.ids.rendered_canvas,
        bitmap: renderCtx.getImageData(0, 0, width, height)
    });
}

async function getPreferences() {
    postMessage({
        action: 'getPreferences'
    });
    return new Promise((resolve) => {
        addEventListener('message', function onPreferences(event) {
            const { data } = event;
            if(data.action === 'setPreferences') {
                removeEventListener('message', onPreferences);
                if(!data.preferences) return resolve({empty: true});
                resolve(data.preferences);
            }
        });
    }); 
}

function setAllCanvasSizes(width, height) {
    postMessage({
        action: 'setCanvasSize',
        canvas: constants.ids.original_canvas,
        width: width,
        height: height
    });
    setProcessedCanvasSize(width, height);
}
function setProcessedCanvasSize(width, height) {
    renderCanvas.width = width;
    renderCanvas.height = height;
    postMessage({
        action: 'setCanvasSize',
        canvas: constants.ids.processed_canvas,
        width: width,
        height: height
    });
    postMessage({
        action: 'setCanvasSize',
        canvas: constants.ids.rendered_canvas,
        width: width,
        height: height
    });
}
