import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['dist', '**/coverage', '**/__snapshots__/**'],
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  type: 'lib',
  typescript: true,
  vue: false,
})
