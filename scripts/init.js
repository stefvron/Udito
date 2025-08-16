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

    // Load the configuration file
    const reqConf = await fetch('/config.json');
    if(!reqConf.ok) {
        console.error('Failed to load configuration:', reqConf.statusText);
        return false;
    }
    config = await reqConf.json();


    // Initialise the interface
    addImageUpload(main);
    insertDivider(main);
    addBasicSettings(main);

    return true;
}

function insertDivider(main) {
    let hr = document.createElement('hr');
    main.appendChild(hr);
}

function addImageUpload(main) {
    let imgUpload = document.createElement('input');
    imgUpload.type = 'file';
    imgUpload.accept = 'image/png, image/jpeg';
    imgUpload.id = 'uploadSource';
    // TODO: handle upload
    main.appendChild(imgUpload);
}

function addBasicSettings(main) {
    try {
        addColourPalettes(main);
        addColouringAlgorithms(main);
        addColourComparison(main);
    } catch (error) {
        console.error('Config-error adding basic settings:', error);
    }
}
function addColourPalettes(main) {
    let label = document.createElement('label');
    label.textContent = 'Colour Palette: ';
    label.htmlFor = 'palette';
    main.appendChild(label);
    let select = document.createElement('select');
    select.id = 'palette';
    // Load palette groups
    config.palettes.forEach(group => {
        let optgroup = document.createElement('optgroup');
        optgroup.label = group.group;
        // Load palettes in the group
        group.palettes.forEach(palette => {
            let option = document.createElement('option');
            option.textContent = palette.name;
            option.value = palette.id;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    });
    // TODO: handle palette selection
    main.appendChild(select);
}
function addColouringAlgorithms(main) {
    let label = document.createElement('label');
    label.textContent = 'Colouring Algorithm: ';
    label.htmlFor = 'algorithm';
    main.appendChild(label);
    let select = document.createElement('select');
    select.id = 'algorithm';
    // Load colouring algorithm groups
    config.colouring_algorithms.forEach(group => {
        let optgroup = document.createElement('optgroup');
        optgroup.label = group.group;
        // Load algorithms in the group
        group.algorithms.forEach(algorithm => {
            let option = document.createElement('option');
            option.textContent = algorithm.name;
            option.value = algorithm.id;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    });
    // TODO: handle algorithm selection
    main.appendChild(select);
}
function addColourComparison(main) {
    let label = document.createElement('label');
    label.textContent = 'Colour Comparison: ';
    label.htmlFor = 'comparison';
    main.appendChild(label);
    let select = document.createElement('select');
    select.id = 'comparison';
    // Load colour comparison algorithms
    config.colour_comparison.forEach(algorithm => {
        let option = document.createElement('option');
        option.textContent = algorithm.name;
        option.value = algorithm.function_name;
        select.appendChild(option);
    });
    // TODO: handle comparison selection
    main.appendChild(select);
}
