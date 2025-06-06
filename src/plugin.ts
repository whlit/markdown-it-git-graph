import type { PluginWithOptions } from 'markdown-it'
import type { MarkdownItGitGraphOptions, RequiredOptions } from './options.js'
import { getBranches } from './git.js'
import { getOptions, parseTheme } from './options.js'
import { getTable } from './table.js'

const GitGraphPlugin: PluginWithOptions<MarkdownItGitGraphOptions>
  = (md, options?: MarkdownItGitGraphOptions) => {
    const gitGraphOptions = getOptions(options)
    const fence = md.renderer.rules.fence
    md.renderer.rules.fence = (
      tokens,
      idx,
      options,
      env,
      self,
    ) => {
      const token = tokens[idx]
      const language = token.info.trim()

      if (language.startsWith('git-graph')) {
        return parse(idx, token.content, {
          ...gitGraphOptions,
          theme: {
            ...gitGraphOptions.theme,
            ...parseTheme(language.slice(9)),
          },
        })
      }
      return fence?.(
        tokens,
        idx,
        options,
        env,
        self,
      ) ?? ''
    }
  }

function parse(idx: number, content: string, options: RequiredOptions): string {
  const branches = getBranches(content, options.defaultBranchName)
  const table = getTable(idx, branches, options)
  return table.draw(idx.toString(), options.theme)
}

export { GitGraphPlugin }
