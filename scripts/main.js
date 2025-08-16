import { init, config } from './init.js';

// Initialise the interface based on the config
await init();

console.log("Config", config);
