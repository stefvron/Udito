import { init, config } from './init.js';

// Initialise the interface based on the config
let success = await init();
if (!success) {
    console.error('Failed to initialise the interface.');
}
