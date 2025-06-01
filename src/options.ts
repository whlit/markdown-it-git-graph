interface MarkdownItGitGraphOptions {

  /**
   * The default branch name.
   */
  defaultBranchName: string

  /**
   * The branch colors.
   */
  colors: string[]
}

const defaultOptions: MarkdownItGitGraphOptions = {
  defaultBranchName: 'main',
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
}

export {
  defaultOptions,
  MarkdownItGitGraphOptions,
}
