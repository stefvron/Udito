import Test from './testClass.js';

const uiContainer = document.getElementById('test-div');
// Setup UI
const menu = document.createElement('div');
menu.id = 'test-menu';
setupMenu(menu);
uiContainer.appendChild(menu);
const divider = document.createElement('hr');
uiContainer.appendChild(divider);
const testList = document.createElement('div');
testList.id = 'test-list';
uiContainer.appendChild(testList);

let tests = [];

export function registerTest(name, descr, func, values, expected, options = {}) {
    const newTest = new Test(name, descr, func, values, expected, testList, options);
    tests.push(newTest);
    return newTest;
}

/*
 * registerTest("Example: Addition", "Tests simple addition function", (a, b) => a + b,
 *     [[1, 2], [3, 4], [5, 6]],
 *     [3, 7, 11]
 * );
 */
// UI Functions
function setupMenu() {
    menu.innerHTML = '';

    const runAllButton = document.createElement('input');
    runAllButton.type = 'button';
    runAllButton.value = 'Run All Tests';
    runAllButton.onclick = runAllTests;
    menu.appendChild(runAllButton);

    const resetButton = document.createElement('input');
    resetButton.type = 'button';
    resetButton.value = 'Reset Tests';
    resetButton.onclick = resetTests;
    menu.appendChild(resetButton);
}

function runAllTests() {
    tests.forEach(test => test.run());
}
function resetTests() {
    tests.forEach(test => test.reset());
}
