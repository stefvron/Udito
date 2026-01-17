import { config } from './constants.js';
import { applyShader } from './utils.js';
import { applyFunction } from './apply_dithering.js';

export async function pixelArtRendering(canvas, preferences) {
    const palette = config.palettes.flatMap(g => g.palettes)
        .find(pal => pal.id === preferences.palette);
    const algorithm = config.colouring_algorithms.flatMap(g => g.algorithms)
        .find(alg => alg.id === preferences.algorithm);
    const comparison = config.colour_comparison
        .find(comp => comp.id === preferences.comparison);
    const errFac = preferences.error_factor;

    if(algorithm.type == "shader") {
        await applyShader(
            canvas, {
            palette: palette,
            algorithm: algorithm,
            comparison: comparison,
            errFac: errFac
        });
    } else {
        await applyFunction(
            canvas, {
            palette: palette,
            algorithm: algorithm,
            comparison: comparison,
            errFac: errFac
        });
    }
}
