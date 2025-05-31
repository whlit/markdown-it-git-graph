const md = require('markdown-it')()
const plugin = require('./dist/cjs/index').GitGraphPlugin

md.use(plugin)

const input = document.getElementById('input')
const output = document.getElementById('output')
const button = document.getElementById('render')

button.addEventListener('click', () => {
  const result = md.render(input.value.trim())

  output.innerHTML = result
})
