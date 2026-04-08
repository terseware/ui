import {z} from 'zod';

export const terseConfigSchema = z.object({
  $schema: z.string().optional(),
  prefix: z.string().min(1).default('app'),
  outputDir: z.string().min(1).default('src/components/ui'),
  uiPackage: z.string().default('@terseware/ui'),
  style: z.enum(['none', 'tailwind']).default('none'),
  aliases: z
    .object({
      components: z.string().optional(),
    })
    .optional(),
});

export type TerseConfig = z.infer<typeof terseConfigSchema>;
