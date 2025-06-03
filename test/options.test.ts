import { expect, it } from 'vitest'
import { parseTheme } from '../src/options'

it('parsetheme', () => {
  expect(parseTheme('')).toEqual({})
  expect(parseTheme('aa=bb')).toEqual({})
  expect(parseTheme('colors=red')).toEqual({
    colors: ['red'],
  })
  expect(parseTheme('colors=red,blue')).toEqual({
    colors: ['red', 'blue'],
  })
  expect(parseTheme('pointSpace=3')).toEqual({
    pointSpace: 3,
  })
  expect(parseTheme('pointSpace=false')).toEqual({})
  expect(parseTheme('pointSpace=')).toEqual({})
  expect(parseTheme('pointSpace')).toEqual({})
  expect(parseTheme('showHash=true')).toEqual({
    showHash: true,
  })
  expect(parseTheme('showHash=false')).toEqual({
    showHash: false,
  })
  expect(parseTheme('showHash=fals')).toEqual({})
  expect(parseTheme('showHash')).toEqual({})
})
