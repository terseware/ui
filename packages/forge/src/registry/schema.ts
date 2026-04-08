import {z} from 'zod';

export const registryDirectiveSchema = z.object({
  /** Class name: "Button", "HardDisabled", etc. */
  type: z.string(),
  /** Import path: "@terseware/ui/button", "@terseware/ui/atoms" */
  importPath: z.string(),
  /** Input mappings: { inputName: defaultAlias } */
  inputs: z.record(z.string(), z.string()).optional(),
  /** Output mappings: { outputName: defaultAlias } */
  outputs: z.record(z.string(), z.string()).optional(),
});

export type RegistryDirective = z.infer<typeof registryDirectiveSchema>;

export const registryInjectSchema = z.object({
  type: z.string(),
  importPath: z.string(),
  as: z.string().optional(),
});

export type RegistryInject = z.infer<typeof registryInjectSchema>;

export const registryTemplateSchema = z.object({
  description: z.string(),
  /** Selector pattern with {prefix} placeholder: "button[{prefix}Button]" */
  selector: z.string(),
  isComponent: z.literal(true),
  hostBindings: z.record(z.string(), z.string()).optional(),
  templateContent: z.string(),
  injects: z.array(registryInjectSchema).optional(),
  constructorLogic: z.string().optional(),
  additionalDirectives: z.array(registryDirectiveSchema).optional(),
});

export type RegistryTemplate = z.infer<typeof registryTemplateSchema>;

export const registryPresetSchema = z.object({
  description: z.string(),
  selector: z.string(),
  dependencies: z.array(z.string()).default([]),
});

export type RegistryPreset = z.infer<typeof registryPresetSchema>;

export const registryComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  /** All directives available for composition */
  directives: z.array(registryDirectiveSchema),
  /** Directive types always included in generation */
  core: z.array(z.string()),
  /** Directive types the user can opt into */
  optional: z.array(z.string()),
  /** Named templates for Mode 2 */
  templates: z.record(z.string(), registryTemplateSchema).optional(),
  /** Named presets for Mode 3 */
  presets: z.array(z.string()).optional(),
  /** Other registry components this depends on */
  registryDependencies: z.array(z.string()).optional(),
});

export type RegistryComponent = z.infer<typeof registryComponentSchema>;
