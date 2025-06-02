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

export {
  getOptions,
  MarkdownItGitGraphOptions,
  RequiredOptions,
  RequiredSvgTheme as RequiredTheme,
  SvgTheme,
}
