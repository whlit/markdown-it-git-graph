import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '../../styles/index.css'

export default <Theme>{
  extends: DefaultTheme,
  enhanceApp: async () => {},
}
