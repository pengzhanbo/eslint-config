import { isPackageExists } from 'local-pkg'
import { GLOB_CSS, GLOB_LESS, GLOB_MARKDOWN, GLOB_POSTCSS, GLOB_SCSS } from '../globs'
import type { VendoredPrettierOptions } from '../vender/prettier-types'
import { interopDefault } from '../utils'
import type { FlatConfigItem, OptionsFormatters, StylisticConfig } from '../types'
import { StylisticConfigDefaults } from './stylistic'

const formatterPackages = ['eslint-plugin-format']

export async function formatters(
  options: OptionsFormatters | true = {},
  stylistic: StylisticConfig = {},
  markdownEnabled = true,
): Promise<FlatConfigItem[]> {
  const unInstalled = formatterPackages.filter(i => !isPackageExists(i))

  if (unInstalled.length > 0) {
    console.warn(`${unInstalled.join(', ')} is not installed, please install it first.\n Run \`npm install -D ${unInstalled.join(' ')}\``)
    return []
  }

  if (options === true) {
    options = {
      css: true,
      graphql: true,
      html: true,
      markdown: true,
      toml: true,
    }
  }

  const {
    indent,
    quotes,
    semi,
  } = {
    ...StylisticConfigDefaults,
    ...stylistic,
  }

  const prettierOptions: VendoredPrettierOptions = Object.assign(
    {
      semi,
      singleQuote: quotes === 'single',
      tabWidth: typeof indent === 'number' ? indent : 2,
      trailingComma: 'all',
      useTabs: indent === 'tab',
    } satisfies VendoredPrettierOptions,
    options.prettierOptions || {},
  )

  const dprintOptions = Object.assign(
    {
      indentWidth: typeof indent === 'number' ? indent : 2,
      quoteStyle: quotes === 'single' ? 'preferSingle' : 'preferDouble',
      useTabs: indent === 'tab',
    },
    options.dprintOptions || {},
  )

  const pluginFormat = await interopDefault(import('eslint-plugin-format'))

  const configs: FlatConfigItem[] = [
    {
      name: 'antfu:formatters:setup',
      plugins: {
        format: pluginFormat,
      },
    },
  ]

  if (options.css) {
    configs.push(
      {
        files: [GLOB_CSS, GLOB_POSTCSS],
        languageOptions: {
          parser: pluginFormat.parserPlain,
        },
        name: 'config:formatter:css',
        rules: {
          'format/prettier': [
            'error',
            {
              ...prettierOptions,
              parser: 'css',
            },
          ],
        },
      },
      {
        files: [GLOB_SCSS],
        languageOptions: {
          parser: pluginFormat.parserPlain,
        },
        name: 'config:formatter:scss',
        rules: {
          'format/prettier': [
            'error',
            {
              ...prettierOptions,
              parser: 'scss',
            },
          ],
        },
      },
      {
        files: [GLOB_LESS],
        languageOptions: {
          parser: pluginFormat.parserPlain,
        },
        name: 'config:formatter:less',
        rules: {
          'format/prettier': [
            'error',
            {
              ...prettierOptions,
              parser: 'less',
            },
          ],
        },
      },
    )
  }

  if (options.html) {
    configs.push({
      files: ['**/*.html'],
      languageOptions: {
        parser: pluginFormat.parserPlain,
      },
      name: 'config:formatter:html',
      rules: {
        'format/prettier': [
          'error',
          {
            ...prettierOptions,
            parser: 'html',
          },
        ],
      },
    })
  }

  if (options.toml) {
    configs.push({
      files: ['**/*.toml'],
      languageOptions: {
        parser: pluginFormat.parserPlain,
      },
      name: 'config:formatter:toml',
      rules: {
        'format/dprint': [
          'error',
          {
            ...dprintOptions,
            language: 'toml',
          },
        ],
      },
    })
  }

  if (options.markdown) {
    const formatter = options.markdown === true
      ? 'prettier'
      : options.markdown

    configs.push({
      files: markdownEnabled
        ? ['**/*.__markdown_content__']
        : [GLOB_MARKDOWN],
      languageOptions: {
        parser: pluginFormat.parserPlain,
      },
      name: 'config:formatter:markdown',
      rules: {
        [`format/${formatter}`]: [
          'error',
          formatter === 'prettier'
            ? {
                ...prettierOptions,
                embeddedLanguageFormatting: 'off',
                parser: 'markdown',
              }
            : {
                ...dprintOptions,
                language: 'markdown',
              },
        ],
      },
    })
  }

  if (options.graphql) {
    configs.push({
      files: ['**/*.graphql'],
      languageOptions: {
        parser: pluginFormat.parserPlain,
      },
      name: 'config:formatter:graphql',
      rules: {
        'format/prettier': [
          'error',
          {
            ...prettierOptions,
            parser: 'graphql',
          },
        ],
      },
    })
  }

  return configs
}
