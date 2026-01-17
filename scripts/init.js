import { constants, config } from './constants.js';
import { shader_attribute_id } from './utils.js';
import { downloadResult, downloadGrid } from './download.js';
/**
 * Config data
 */ 
export let renderer = null;
let originalImageSize = {
    width: 0,
    height: 0
}

/**
 * Initialise the interface and configuration
 */
export async function init() {
    // Getting the main element for the interface
    const main = document.getElementsByTagName('main')[0];
    if(!main) {
        console.error('Main element not found in the document.');
        return false;
    }

    renderer = new Worker('./scripts/rendering.js', { type: 'module' });

    // Initialise the interface
    let success =
        addImageUpload(main) &&
        insertDivider(main) &&
        addBasicSettings(main) &&
        insertDivider(main) &&
        addIntermediateShaders(main) &&
        insertDivider(main) &&
        addResizing(main) &&
        insertDivider(main) &&
        addPreview(main) &&
        insertDivider(main) &&
        addDownloadSection(main);

    return success;
}

function insertDivider(main) {
    let hr = document.createElement('hr');
    main.appendChild(hr);

    return true;
}

function addImageUpload(main) {
    let imgUpload = document.createElement('input');
    imgUpload.type = 'file';
    imgUpload.accept = 'image/png, image/jpeg';
    imgUpload.id = constants.ids.image_upload;
    imgUpload.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                renderer.postMessage({
                    action: "loadImage",
                    image: await createImageBitmap(img)
                });
                originalImageSize.width = img.width;
                originalImageSize.height = img.height;
                const width_in = document.getElementById(constants.ids.width_px);
                width_in.value = img.width;
                const height_in = document.getElementById(constants.ids.height_px);
                height_in.value = img.height;
                height_in.dispatchEvent(new Event('change'));
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    main.appendChild(imgUpload);

    return true;
}

function addBasicSettings(main) {
    try {
        addColourPalettes(main);
        addColouringAlgorithms(main);
        addColourComparison(main);
        addErrorFactor(main);
    } catch (error) {
        console.error('Config-error adding basic settings:', error);
        return false;
    }
    return true;
}

function addIntermediateShaders(main) {
    config.intermediate_shaders.forEach(shader => addShader(main, shader));
    return true;
}
function addShader(main, shader) {
    let title = document.createElement('h3');
    title.textContent = shader.name;
    main.appendChild(title);
    shader.shader_arguments.forEach(arg => addShaderArgument(main, arg, shader.id));
}
function addShaderArgument(main, arg, shader) {
    const name = arg.name;
    const id = shader_attribute_id(shader, arg.id);
    const type = arg.type;
    const changeHandler = () => renderImage(true);

    let elements;
    if (type === "float" || type === "int") {
        const step = constants.slider[type].step_size;
        elements = generateSlider(
            name,
            id,
            arg.min,
            arg.max,
            step,
            arg.default,
            changeHandler
        );
    } else {
        console.error(`Unknown argument type: ${type}`);
        return;
    }

    elements.forEach(el => main.appendChild(el));
}

function generateSelection(name, id, path, object, changeHandler) {
    const strErr = "is not a string";
    const funcErr = "is not a function";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});
    console.assert(typeof path === "string", "%o", {path, strErr});
    console.assert(typeof changeHandler === "function", "%o", {changeHandler, funcErr});

    let outElements = [];

    outElements.push(generateLabel(name, id));
    let select = document.createElement('select');
    select.id = id;

    if(path != "") {
        object.forEach(group => {
            let optgroup = document.createElement('optgroup');
            optgroup.label = group.group;
            createOptions(group[path], optgroup);
            select.appendChild(optgroup);
        });
    } else createOptions(object, select);
    select.onchange = changeHandler;
    outElements.push(select);

    return outElements;
    
    function createOptions(object, parent) {
        object.forEach(opt => {
            let option = document.createElement('option');
            option.textContent = opt.name;
            option.value = opt.id;
            parent.appendChild(option);
        });
    }
}
function addColourPalettes(main) {
    const name = "Colour Palette";
    const id = constants.ids.palettes;
    const path = "palettes";
    const baseObj = config.palettes;
    const onchange = () => renderFinalImage(true);
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addColouringAlgorithms(main) {
    const name = "Colouring Algorithm";
    const id = constants.ids.colouring_algorithm;
    const path = "algorithms";
    const baseObj = config.colouring_algorithms;
    const onchange = () => {
        setErrorFactorSlider();
        renderFinalImage(true);
    };
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addColourComparison(main) {
    const name = "Colour Comparison";
    const id = constants.ids.colour_comparison;
    const path = "";
    const baseObj = config.colour_comparison;
    const onchange = () => renderFinalImage(true);
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addErrorFactor(main) {
    const name = "Error Factor";
    const id = constants.ids.error_factor;
    const min = constants.error_factor.min;
    const max = constants.error_factor.max;
    const step = constants.slider.float.step_size;
    const val = constants.error_factor.default;
    const changeHandler = renderFinalImage
    const elements = generateSlider(name, id, min, max, step, val, changeHandler);
    elements.forEach(el => main.appendChild(el));
    setErrorFactorSlider();
}
function setErrorFactorSlider() {
    const value = document.getElementById(constants.ids.colouring_algorithm).value;
    const has_error = config.colouring_algorithms.some(group => {
        return group.algorithms.some(alg => {
            return alg.id === value && alg.has_error;
        });
    });
    const errorSlider = document.getElementById(constants.ids.error_factor);
    if(has_error) errorSlider.disabled = false;
    else errorSlider.disabled = true;
}

function generateSlider(name, id, min, max, step, val, changeHandler) {
    const strErr = "is not a string";
    const numErr = "is not a number";
    const funcErr = "is not a function";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});
    console.assert(typeof min === "number", "%o", {min, numErr});
    console.assert(typeof max === "number", "%o", {max, numErr});
    console.assert(typeof step === "number", "%o", {step, numErr});
    console.assert(typeof val === "number", "%o", {val, numErr});
    console.assert(typeof changeHandler === "function", "%o", {changeHandler, funcErr});

    let outElements = [];

    outElements.push(document.createElement('br')); // Add a line break for spacing

    outElements.push(generateLabel(name, id));

    let valueText = document.createElement('span');
    valueText.id = `${id}Label`;
    valueText.textContent = `${val}`;

    let slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = val;
    slider.oninput = (event) => {
        // Update the label text with the current value
        document.getElementById(`${id}Label`).textContent =
            `${event.target.value}`;
    };
    slider.onchange = changeHandler;
    
    outElements.push(slider);
    outElements.push(valueText);

    return outElements;
}

function addResizing(main) {
    let name = "Width %";
    let id = constants.ids.width_percent;
    let min = 1;
    let max = 100;
    let step = constants.slider.int.step_size;
    let val = 100;
    let changeHandler = (event) => {
        const keepAspectRatio = document.getElementById(constants.ids.keep_aspect_ratio);
        const widthPixels = document.getElementById(constants.ids.width_px);
        const heightPixels = document.getElementById(constants.ids.height_px);
        const widthPercentage = document.getElementById(constants.ids.width_percent);
        const heightPercentage = document.getElementById(constants.ids.height_percent);

        if(!event || event.target === keepAspectRatio) {
            if(keepAspectRatio.checked) {
                heightPercentage.disabled = true;
                event = {
                    target: widthPercentage
                };
            }
            else heightPercentage.disabled = false;
        }
        if(!event) return;

        const target = event.target;
        if(target.id === constants.ids.width_percent) {
            const width = originalImageSize.width * (target.value / 100.0);
            widthPixels.value = Math.round(width);
            if(keepAspectRatio.checked) {
                const height = originalImageSize.height * (target.value / 100.0);
                heightPixels.value = Math.round(height);
                heightPercentage.value = widthPercentage.value;
                heightPercentage.dispatchEvent(new Event('input'));
            }
        } else if(target.id === constants.ids.height_percent) {
            const height = originalImageSize.height * (target.value / 100.0);
            heightPixels.value = Math.round(height);
        } else if(target.id === constants.ids.width_px) {
            const width = Math.round(parseFloat(target.value));
            if(isNaN(width)) return;
            const percentage = (width / originalImageSize.width) * 100.0;
            widthPercentage.value = Math.round(percentage);
            widthPercentage.dispatchEvent(new Event('input'));
            if(keepAspectRatio.checked) {
                heightPercentage.value = percentage;
                heightPercentage.dispatchEvent(new Event('input'));
                const height = originalImageSize.height * (percentage / 100.0);
                heightPixels.value = Math.round(height);
            }
        } else if(target.id === constants.ids.height_px) {
            const height = Math.round(parseFloat(target.value));
            if(isNaN(height)) return;
            const percentage = (height / originalImageSize.height) * 100.0;
            heightPercentage.value = Math.round(percentage);
            heightPercentage.dispatchEvent(new Event('input'));
            if(keepAspectRatio.checked) {
                const width = originalImageSize.width * (percentage / 100.0);
                widthPixels.value = Math.round(width);
                widthPercentage.value = heightPercentage.value;
                widthPercentage.dispatchEvent(new Event('input'));
            }
        }

        renderImage(true);
    }
    let elements = generateSlider(name, id, min, max, step, val, changeHandler);
    name = "Width (px)";
    id = constants.ids.width_px;
    elements = elements.concat(generateNumberBox(name, id, val, changeHandler));

    name = "Height %";
    id = constants.ids.height_percent;
    elements = elements.concat(generateSlider(name, id, min, max, step, val, changeHandler));
    name = "Height (px)";
    id = constants.ids.height_px;
    elements = elements.concat(generateNumberBox(name, id, val, changeHandler));

    elements.push(document.createElement('br')); // Add a line break for spacing
    name = "Keep Aspect Ratio";
    id = constants.ids.keep_aspect_ratio;
    let checked = true;
    elements = elements.concat(generateCheckbox(name, id, checked, changeHandler));

    elements.forEach(el => main.appendChild(el));
    changeHandler();

    return true;
}

function generateNumberBox(name, id, value, changeHandler) {
    const strErr = "is not a string";
    const numErr = "is not a number";
    const funcErr = "is not a function";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});
    console.assert(typeof value === "number", "%o", {value, numErr});
    console.assert(typeof changeHandler === "function", "%o", {changeHandler, funcErr});

    let outElements = [];
    outElements.push(generateLabel(name, id));
    let input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.value = value;
    input.onchange = changeHandler;
    outElements.push(input);
    return outElements;
}
function generateLabel(name, forId) {
    let label = document.createElement('label');
    label.textContent = `${name}: `;
    label.htmlFor = forId;
    return label;
}
function generateCheckbox(name, id, checked, changeHandler) {
    const strErr = "is not a string";
    const funcErr = "is not a function";
    const boolErr = "is not a boolean";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});
    console.assert(typeof checked === "boolean", "%o", {checked, boolErr});
    console.assert(typeof changeHandler === "function", "%o", {changeHandler, funcErr});

    let outElements = [];
    outElements.push(generateLabel(name, id));
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.onchange = changeHandler;
    outElements.push(checkbox);

    return outElements;
}
function generateButton(name, id, clickHandler) {
    const strErr = "is not a string";
    const funcErr = "is not a function";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});
    console.assert(typeof clickHandler === "function", "%o", {clickHandler, funcErr});

    let outElements = [];

    let button = document.createElement('button');
    button.textContent = name;
    button.id = id;
    button.onclick = clickHandler;

    return outElements.concat(button);
}

function addPreview(main) {
    let elements = [];
    let name = "Live Preview";
    let id = constants.ids.live_preview;
    let checked = true;
    let changeHandler = (event) => {
        const live = event.target.checked;
        const renderButton = document.getElementById(constants.ids.render_button);
        if(live) {
            renderButton.disabled = true;
            renderImage(true);
        }
        else renderButton.disabled = false;
    };
    elements = elements.concat(generateCheckbox(name, id, checked, changeHandler));
    name = "Render Preview";
    id = constants.ids.render_button;
    let clickHandler = () => renderImage(false);
    elements = elements.concat(generateButton(name, id, clickHandler));
    elements.push(document.createElement('br'));

    elements = elements.concat(generatePreviewCanvas("Unmodified Image", constants.ids.original_canvas));
    elements = elements.concat(generatePreviewCanvas("Processed Image", constants.ids.processed_canvas));
    elements = elements.concat(generatePreviewCanvas("Result", constants.ids.rendered_canvas));

    elements.forEach(el => main.appendChild(el));

    return true;
}
function generatePreviewCanvas(name, id) {
    const strErr = "is not a string";
    console.assert(typeof name === "string", "%o", {name, strErr});
    console.assert(typeof id == "string", "%o", {id, strErr});

    let outElements = [];
    
    let canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = 100;
    canvas.height = 100;
    outElements.push(canvas);

    return outElements;
}
function renderImage(checkLive) {
    const livePreview = document.getElementById(constants.ids.live_preview);
    if(checkLive && (!livePreview || !livePreview.checked)) return;
    renderer.postMessage({
        action: 'renderImage'
    });
}
function renderFinalImage(checkLive) {
    const livePreview = document.getElementById(constants.ids.live_preview);
    if(checkLive && (!livePreview || !livePreview.checked)) return;
    renderer.postMessage({
        action: 'renderFinalImage'
    });
}
function addDownloadSection(main) {
    let name = "Download Result";
    let id = constants.ids.download_button;
    let clickHandler = () => {
        downloadResult();
    };
    let elements = [];
    elements = elements.concat(generateButton(name, id, clickHandler));
    name = "Download Grid";
    id = constants.ids.download_grid_button;
    clickHandler = () => {
        downloadGrid();
    };
    elements = elements.concat(generateButton(name, id, clickHandler));
    elements.forEach(el => main.appendChild(el));

    return true;
}

