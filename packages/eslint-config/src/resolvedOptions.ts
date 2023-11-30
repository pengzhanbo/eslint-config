import process from 'node:process'
import { isPackageExists } from 'local-pkg'
import type { FlatConfigItem, OptionsConfig, OptionsTailwindCSS, OptionsUnoCSS, StylisticConfig } from './types'

const VuePackages = [
  'vue',
  'nuxt',
  'vitepress',
  '@slidev/cli',
]

type ResolvedOptions = Required<OptionsConfig> & FlatConfigItem & {
  stylistic: false | StylisticConfig
  unocss: false | OptionsUnoCSS
  tailwindcss: false | OptionsTailwindCSS
}

export function resolveOptions(options: OptionsConfig & FlatConfigItem = {}): ResolvedOptions {
  const {
    componentExts = [],
    preset = [],
    gitignore = true,
    isInEditor = !!((process.env.VSCODE_PID || process.env.JETBRAINS_IDE) && !process.env.CI),
    overrides = {},
    typescript = isPackageExists('typescript'),
    jsx = true,
    test = true,
    jsonc = true,
    yaml = true,
    markdown = true,
    unocss: enableUnocss = false,
    tailwindcss: enableTailwindcss = false,
  } = options

  const stylistic = options.stylistic === false
    ? false
    : typeof options.stylistic === 'object'
      ? options.stylistic
      : {}
  if (stylistic && !('jsx' in stylistic))
    stylistic.jsx = options.jsx ?? true

  const unocss = enableUnocss === false
    ? false
    : typeof enableUnocss === 'object'
      ? enableUnocss
      : {}

  const tailwindcss = enableTailwindcss === false
    ? false
    : typeof enableTailwindcss === 'object'
      ? enableTailwindcss
      : {}

  if (VuePackages.some(i => isPackageExists(i)))
    componentExts.push('vue')

  if (isPackageExists('astro'))
    componentExts.push('astro')

  if (isPackageExists('svelte'))
    componentExts.push('svelte')

  return {
    ...options,
    componentExts,
    preset,
    gitignore,
    isInEditor,
    overrides,
    typescript,
    stylistic,
    jsx,
    test,
    jsonc,
    yaml,
    markdown,
    unocss,
    tailwindcss,
  }
}
