import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['dist', '**/coverage', '**/__snapshots__/**', 'node_modules', '**/*.md'],
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  type: 'lib',
  typescript: true,
  vue: false,
  rules: {
    'object-curly-newline': ['error', {
      ObjectExpression: { // 对象无属性时不允许换行
        multiline: true,
        minProperties: 1,
      },
      ObjectPattern: 'never', // 结构赋值不允许换行
      ImportDeclaration: 'never', // 导入的不允许换行
      ExportDeclaration: { // 导出的最少5个属性时必须换行
        multiline: true,
        minProperties: 5,
      },
    }],
    'function-paren-newline': ['error', {
      minItems: 5, // 函数参数最少5个时必须换行，否则不允许换行
    }],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
  },
})
