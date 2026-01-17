/**
 * Test Class
 * @param {string} name - The name of the test
 * @param {string} descr - A description of the test
 * @param {function} func - The function to be tested
 * @param {Array} values - The input values for the test
 * @param {Array} expected - The expected output of the test values
 */
export default class {
    constructor(name, descr, func, values, expected, uiContainer = null, options = {}) {
        this.name = name;
        this.descr = descr;
        this.func = func;
        this.values = values;
        for(let i = 0; i < values.length; i++) {
            if(!Array.isArray(values[i])) {
                this.values[i] = [values[i]];
            }
        }
        this.expected = expected;
        this.passed = []; // null = not run, true = passed, false = failed
        this.results = [];
        this.options = options;

        if(uiContainer) {
            this.uiElement = document.createElement('div');
            this.uiElement.className = 'test-item';
            
            const id = this.generateID();
            if(document.getElementById(id) !== null) {
                throw new Error(`Test with name ${name} already exists.`);
            }
            this.uiElement.id = id;
            uiContainer.appendChild(this.uiElement);
            this.updateUI();
        }
    }

    run() {
        this.reset();
        for(let i = 0; i < this.values.length; i++) {
            try {
                const result = this.func(...this.values[i]);
                this.results[i] = result;
                if(this.options.resultProcessor !== undefined) {
                    console.log('Processing result', result);
                    this.results[i] = this.options.resultProcessor(result);
                }
                const resArr = Array.isArray(this.results[i]) ? this.results[i] : [this.results[i]];
                const differences = [];
                for(let j = 0; j < resArr.length; j++) {
                    differences.push(Math.abs(resArr[j] - this.expected[i][j]));
                }
                if(this.options.tolerance !== undefined) {
                    this.passed[i] = true;
                    for(let j = 0; j < differences.length; j++) {
                        if(differences[j] > this.options.tolerance) {
                            this.passed[i] = false;
                            break;
                        }
                    }
                } else if(result === this.expected[i]) {
                    this.passed[i] = true;
                } else {
                    this.passed[i] = false;
                }
            } catch (e) {
                this.passed[i] = false;
                this.results[i] = `Error: ${e.message}`;
            }
        }
        this.updateUI();
    }
    reset() {
        this.passed = [];
        this.results = [];
        this.updateUI();
    }
    updateUI() {
        if(!this.uiElement) return;
        this.uiElement.innerHTML = '';

        const title = document.createElement('h3');
        title.textContent = this.name;
        title.className = 'test-title';
        this.uiElement.appendChild(title);
        const description = document.createElement('p');
        description.textContent = this.descr;
        description.className = 'test-description';
        this.uiElement.appendChild(description);
        const runButton = document.createElement('input');
        runButton.type = 'button';
        runButton.className = 'test-run-button';
        runButton.value = 'Run Test';
        runButton.onclick = () => this.run();
        this.uiElement.appendChild(runButton);
        const resetButton = document.createElement('input');
        resetButton.type = 'button';
        resetButton.className = 'test-reset-button';
        resetButton.value = 'Reset Test';
        resetButton.onclick = () => this.reset();
        this.uiElement.appendChild(resetButton);
        const status = document.createElement('p');
        status.className = 'test-status';
        status.onclick = () => toggleResultsVisibility(this.uiElement.id);
        const passedCount = this.passed.filter(p => p === true).length;
        if(this.passed.length === 0) {
            status.textContent = 'Not Run';
            status.style.color = 'gray';
        } else if(passedCount === this.values.length) {
            status.textContent = 'Passed';
            status.style.color = 'green';
        } else {
            status.textContent = `Failed (Passed ${passedCount}/${this.values.length})`;
            status.style.color = 'red';
        }
        this.uiElement.appendChild(status);
        const resultList = document.createElement('div');
        resultList.className = 'test-results';
        for(let i = 0; i < this.results.length; i++) {
            const valueItem = document.createElement('p');
            valueItem.textContent = String(this.values[i]) + ' -> ' + String(this.results[i]);
            valueItem.textContent += ` (Expected: ${String(this.expected[i])})`;
            if(this.passed[i] !== true) {
                valueItem.style.color = 'red';
            } else {
                valueItem.style.color = 'green';
            }
            resultList.appendChild(valueItem);
        }
        this.uiElement.appendChild(resultList);
    }

    generateID() {
        return `test-${this.name.replace(/\s+/g, '-').toLowerCase()}`;
    }
}

function toggleResultsVisibility(id) {
    const testElement = document.getElementById(id);
    if(!testElement) return;
    const status = testElement.getElementsByClassName('test-status')[0];
    if(!status) return;
    if(status.classList.contains('expanded')) {
        status.classList.remove('expanded');
    } else {
        status.classList.add('expanded');
    }
}
