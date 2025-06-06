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
  expect(parseTheme('lineHeight=3')).toEqual({
    lineHeight: 3,
  })
  expect(parseTheme('lineHeight=false')).toEqual({})
  expect(parseTheme('lineHeight=')).toEqual({})
  expect(parseTheme('lineHeight')).toEqual({})
})
