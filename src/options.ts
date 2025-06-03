interface MarkdownItGitGraphOptions {

  /**
   * The default branch name.
   */
  defaultBranchName?: string

  /**
   * The theme of the svg.
   */
  theme?: SvgTheme
}

interface SvgTheme {
  /**
   * The branch colors.
   */
  colors?: string[]
  pointSpace?: number
  lineSpace?: number
  pointRadius?: number
  showBranchInfo?: boolean
  showHash?: boolean
  showDate?: boolean
  dateFormat?: Intl.DateTimeFormatOptions
  /**
   * 字符宽度，用于非精确的计算文本长度
   */
  charWidth?: number
}

const defaultTheme: RequiredSvgTheme = {
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
  pointSpace: 25,
  lineSpace: 20,
  pointRadius: 5,
  showBranchInfo: true,
  showHash: true,
  showDate: true,
  dateFormat: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  charWidth: 10,
}

const defaultOptions: RequiredOptions = {
  defaultBranchName: 'main',
  theme: defaultTheme,
}
type RequiredSvgTheme = Required<SvgTheme>
type RequiredOptions = Required<{ [K in keyof MarkdownItGitGraphOptions]:
  SvgTheme extends MarkdownItGitGraphOptions[K] ? RequiredSvgTheme : MarkdownItGitGraphOptions[K] }>

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

const themeConverter: { [K in keyof RequiredSvgTheme]: ((str?: string) => any) | undefined } = {
  colors: converters.strings,
  pointSpace: converters.number,
  lineSpace: converters.number,
  pointRadius: converters.number,
  showBranchInfo: converters.boolean,
  showHash: converters.boolean,
  showDate: converters.boolean,
  dateFormat: undefined,
  charWidth: converters.number,
}

function parseTheme(text: string): SvgTheme {
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
  return theme as SvgTheme
}

export {
  getOptions,
  MarkdownItGitGraphOptions,
  parseTheme,
  RequiredOptions,
  RequiredSvgTheme as RequiredTheme,
  SvgTheme,
}
