export {resolveConfig} from './config/resolve.js';
export {terseConfigSchema, type TerseConfig} from './config/schema.js';
export {generateBare} from './generators/bare.js';
export {generatePreset} from './generators/preset.js';
export {generateTemplate} from './generators/template.js';
export type {FileWriter, GenerateOptions} from './generators/utils.js';
export {loadRegistryComponent} from './registry/index.js';
export {registryComponentSchema, type RegistryComponent} from './registry/schema.js';
