import { constants } from './constants.js';
/**
 * Config data
 */ 
export let config = null;

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

    // Load the configuration file
    const reqConf = await fetch('/config.json');
    if(!reqConf.ok) {
        console.error('Failed to load configuration:', reqConf.statusText);
        return false;
    }
    config = await reqConf.json();

    // Initialise the interface
    let success =
        addImageUpload(main) &&
        insertDivider(main) &&
        addBasicSettings(main) &&
        insertDivider(main) &&
        addIntermediateShaders(main) &&
        insertDivider(main);

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
    imgUpload.id = 'uploadSource';
    // TODO: handle upload
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
function addShaderArgument(main, arg, idPrefix = "") {
    const name = arg.name;
    const id = idPrefix + arg.id;
    const type = arg.type;
    const changeHandler = () => {}; // TODO: handle change

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

    let label = document.createElement('label');
    label.textContent = `${name}: `;
    label.htmlFor = id;
    outElements.push(label);
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
    const id = "palette";
    const path = "palettes";
    const baseObj = config.palettes;
    const onchange = () => {}; // TODO
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addColouringAlgorithms(main) {
    const name = "Colouring Algorithm";
    const id = "algorithm";
    const path = "algorithms";
    const baseObj = config.colouring_algorithms;
    const onchange = () => {
        setErrorFactorSlider();
        //TODO
    };
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addColourComparison(main) {
    const name = "Colour Comparison";
    const id = "comparison";
    const path = "";
    const baseObj = config.colour_comparison;
    const onchange = () => {}; // TODO
    const elements = generateSelection(name, id, path, baseObj, onchange);
    elements.forEach(el => main.appendChild(el));
}
function addErrorFactor(main) {
    const name = "Error Factor";
    const id = "errorFactor";
    const min = constants.error_factor.min;
    const max = constants.error_factor.max;
    const step = constants.slider.float.step_size;
    const val = constants.error_factor.default;
    const changeHandler = () => {}; // TODO
    const elements = generateSlider(name, id, min, max, step, val, changeHandler);
    elements.forEach(el => main.appendChild(el));
    setErrorFactorSlider();
}
function setErrorFactorSlider() {
    const value = document.getElementById("algorithm").value;
    const has_error = config.colouring_algorithms.some(group => {
        return group.algorithms.some(alg => {
            return alg.id === value && alg.has_error;
        });
    });
    const errorSlider = document.getElementById("errorFactor");
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

    let label = document.createElement('label');
    label.textContent = `${name}: `;
    label.htmlFor = id;
    outElements.push(label);

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
