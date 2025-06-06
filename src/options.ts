interface MarkdownItGitGraphOptions {

  /**
   * The default branch name.
   */
  defaultBranchName?: string

  /**
   * The theme of the svg.
   */
  theme?: Theme
}

interface Theme {
  /**
   * The columns to show.
   */
  columns?: Column[]

  /**
   * The date format.
   */
  dateFormat?: Intl.DateTimeFormatOptions

  colors?: string[]
  /**
   * The line height. Mast be greater than 20.
   */
  lineHeight?: number
  lineWidth?: number
  pointRadius?: number
}

type Column = 'hash' | 'message' | 'date'

const defaultTheme: RequiredTheme = {
  colors: [
    '#e6194b',
    '#ffe119',
    '#4363d8',
    '#3cb44b',
    '#f58231',
    '#911eb4',
    '#46f0f0',
    '#f032e6',
    '#bcf60c',
    '#fabebe',
    '#008080',
    '#e6beff',
  ],
  lineHeight: 24,
  lineWidth: 20,
  pointRadius: 5,
  columns: ['message', 'date', 'hash'],
  dateFormat: {
    dateStyle: 'short',
    timeStyle: 'short',
  },
}

const defaultOptions: RequiredOptions = {
  defaultBranchName: 'main',

  theme: defaultTheme,
}
type RequiredTheme = Required<Theme>
type RequiredOptions = Required<{ [K in keyof MarkdownItGitGraphOptions]:
  Theme extends MarkdownItGitGraphOptions[K] ? RequiredTheme : MarkdownItGitGraphOptions[K] }>

function getOptions(options?: MarkdownItGitGraphOptions): RequiredOptions {
  if (!options) {
    return defaultOptions
  }

  const theme = {
    ...defaultOptions.theme,
    ...options.theme,
  }

  return {
    ...defaultOptions,
    ...options,
    theme,
  }
}

const converters = {
  strings: (str?: string) => str ? str.split(',') : undefined,
  number: (str?: string) => {
    if (!str) {
      return undefined
    }
    const num = Number.parseInt(str)
    return Number.isNaN(num) ? undefined : num
  },
  boolean: (str?: string) => str ? str === 'true' ? true : str === 'false' ? false : undefined : undefined,
}

const themeConverter: { [K in keyof RequiredTheme]: ((str?: string) => any) | undefined } = {
  colors: converters.strings,
  lineHeight: converters.number,
  lineWidth: converters.number,
  pointRadius: converters.number,
  columns: converters.strings,
  dateFormat: undefined,
}

function parseTheme(text: string): Theme {
  const strs = text.trim().split('&')
  const obj: { [key: string]: string } = {}
  strs.forEach((str) => {
    const [key, value] = str.split('=')
    if (key && value && key.trim().length > 0 && value.trim().length > 0) {
      obj[key.trim()] = value.trim()
    }
  })
  const theme: { [key: string]: any } = {}
  Object.entries(themeConverter).forEach(([key, converter]) => {
    const str = obj[key]
    if (!str || !converter) {
      return
    }
    const value = converter(str)
    if (value === undefined) {
      return
    }
    theme[key] = value
  })
  return theme as Theme
}

export {
  Column,
  getOptions,
  MarkdownItGitGraphOptions,
  parseTheme,
  RequiredOptions,
  RequiredTheme,
}
