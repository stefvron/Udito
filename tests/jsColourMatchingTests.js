import { registerTest } from './tests.js';
import { degToRad, rgbToLab, labToLch, radToDeg } from '../scripts/module/colour/common.js';

const testPalette = [
    "FF0000", // Red
    "00FF00", // Green
    "0000FF", // Blue
    "FFFF00", // Yellow
    "FF00FF", // Magenta
    "00FFFF", // Cyan
    "000000", // Black
    "FFFFFF", // White
];
const testValues = {
    "FF0000": "FF0000", // Red
    "FE0000": "FF0000", // Almost Red
    "00FF00": "00FF00", // Green
    "00FE00": "00FF00", // Almost Green
    "0000FF": "0000FF", // Blue
    "0000FE": "0000FF", // Almost Blue
    "FFFF00": "FFFF00", // Yellow
    "FFFE00": "FFFF00", // Almost Yellow
    "FF00FF": "FF00FF", // Magenta
    "FE00FF": "FF00FF", // Almost Magenta
    "00FFFF": "00FFFF", // Cyan
    "00FEFF": "00FFFF", // Almost Cyan
    "000000": "000000", // Black
    "010101": "000000", // Almost Black
    "FFFFFF": "FFFFFF", // White
    "FEFEFE": "FFFFFF", // Almost White
};

// COMMONS
const commonsPrefix = 'JavaScript Colour Matching Commons: ';
registerTest(
    commonsPrefix + 'degToRad',
    'Tests the degToRad function used in colour comparisons.',
    degToRad,
    [0, 90, 180, 62, -5],
    [0, 1.57079, 3.14159, 1.08210, -0.08726],
    {tolerance: 0.00001}
)
registerTest(
    commonsPrefix + 'radToDeg',
    'Tests the radToDeg function used in colour comparisons.',
    radToDeg,
    [0, 1, 2, 1.5, -6.2],
    [0, 57.29578, 114.5916, 85.94367, -355.2338],
    {tolerance: 0.0001}
)
registerTest(
    commonsPrefix + 'rgbToLab',
    'Tests the rgbToLab function used in colour comparisons.',
    rgbToLab,
    [
        [[255,   0,   0]],
        [[  0, 255,   0]],
        [[  0,   0, 255]],
        [[255, 255, 255]],
        [[  0,   0,   0]],
        [[ 62, 200,   5]]
    ],
    [
        [  53.23288,   80.10930,   67.22006],
        [  87.73703, - 86.18463,   83.18116],
        [  32.30258,   79.19666, -107.86368],
        [ 100.00000,    0.00526, -  0.01040],
        [   0.00000,    0.00000,    0.00000],
        [  71.19720, - 65.38949,   69.60180]
    ],
    {tolerance: 0.1}
)
registerTest(
    commonsPrefix + 'labToLch',
    'Tests the labToLch function used in colour comparisons.',
    labToLch,
    [
        [[100,    0,    0]],
        [[  0,  128,    0]],
        [[  0,    0,  128]],
        [[ 50,   50,   -50]],
        [[ 75, -100,  100]]
    ],
    [
        [100.0,   0.0,   0.0],
        [  0.0, 128.0,   0.0],
        [  0.0, 128.0,  90.0],
        [ 50.0,  70.7, 315.0],
        [ 75.0, 141.4, 135.0]
    ],
    {tolerance: 0.1}
)
