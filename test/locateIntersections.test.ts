import locateIntersections, { Line } from '../src'
import json from './test.excalidraw.json'

interface ExcalidrawElement {
  type: string
  x: number
  y: number
  points: number[][]
}

interface ExcalidrawFile {
  elements: ExcalidrawElement[]
}

const isLine = (e: ExcalidrawElement): boolean => e.type === 'line'
const toLine = (e: ExcalidrawElement): Line => e.points.map(([x, y]) => [x + e.x, y + e.y])

const parseExcalidrawLines = (j: ExcalidrawFile): Line[] => {
  return j.elements.filter(isLine).map(toLine)
}

test('test1', () => {
  const lines = parseExcalidrawLines(json)
  console.time('locateIntersections')
  for (let i = 0; i < 10000; i++) {
    locateIntersections(lines)
  }
  console.timeEnd('locateIntersections')
  const intersections = locateIntersections(lines)
  console.log(intersections)
  expect(intersections.map((i) => i.point)).toEqual([[50, 0], [80, -60], [100, 0], [300, 0]])
})
