import TinyQueue from 'tinyqueue'

type Point = [number, number]
type Line = Point[]
type Segment = [Point, Point]

interface ActiveSegment {
  lineIndex: number
  vertexIndex: number
  segment: Segment
}

interface SweepEvent {
  vertex: Point
  lineIndex: number
  vertexIndex: number
  otherEvent?: SweepEvent
  isStart: boolean
}

const priority = (e1: SweepEvent, e2: SweepEvent): 1 | 0 | -1 => {
  const [x1, y1] = e1.vertex
  const [x2, y2] = e2.vertex
  if (x1 > x2) return 1
  if (x1 < x2) return -1
  if (e1.lineIndex !== e2.lineIndex && e1.isStart && !e2.isStart) return -1
  if (y1 === y2) return 0
  return y1 > y2 ? 1 : -1
}

const fill = (queue: TinyQueue<SweepEvent>, lines: Line[]): void => {
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let vertex = lines[lineIndex][0]
    let nextVertex: Point | undefined
    for (let vertexIndex = 0; vertexIndex < lines[lineIndex].length - 1; vertexIndex++) {
      nextVertex = lines[lineIndex][vertexIndex + 1]

      const e1: SweepEvent = {
        vertex,
        lineIndex,
        vertexIndex,
        isStart: true
      }
      const e2: SweepEvent = {
        vertex: nextVertex,
        lineIndex,
        vertexIndex,
        isStart: false,
        otherEvent: e1
      }

      e1.otherEvent = e2

      if (priority(e1, e2) > 0) {
        e2.isStart = true
        e1.isStart = false
      } else {
        e1.isStart = true
        e2.isStart = false
      }
      queue.push(e1)
      queue.push(e2)

      vertex = nextVertex
    }
  }
}

const findIntersection = ([[x1, y1], [x2, y2]]: Segment, [[x3, y3], [x4, y4]]: Segment): Point | undefined => {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
  if (denom === 0) return undefined
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom
  const intersected = ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
  if (!intersected) return undefined
  return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)]
}

const segmentPriority = (a: ActiveSegment, b: ActiveSegment): 1 | 0 | -1 => {
  const seg1 = a.segment
  const seg2 = b.segment
  if (seg1[1][0] > seg2[1][0]) return 1
  if (seg1[1][0] < seg2[1][0]) return -1
  if (seg1[1][1] !== seg2[1][1]) {
    return seg1[1][1] < seg2[1][1] ? 1 : -1
  }
  return 1
}

const isAdjoiningSegments = (a: ActiveSegment, b: ActiveSegment): boolean => {
  if (a.lineIndex !== b.lineIndex) return false
  return Math.abs(a.vertexIndex - b.vertexIndex) <= 1
}

const sweep = (eventQueue: TinyQueue<SweepEvent>): Point[] => {
  const intersectionPoints = []
  const segmentList = new TinyQueue([], segmentPriority)

  while (eventQueue.length > 0) {
    const event = eventQueue.pop()
    if (event === undefined) break
    if (event.otherEvent === undefined) continue
    console.log('eventQueue', event.lineIndex, event.vertexIndex, event.isStart ? 'str' : 'end', event.vertex, '->', event.otherEvent.vertex)

    if (!event.isStart) {
      segmentList.pop()
      continue
    }

    const segment: ActiveSegment = {
      lineIndex: event.lineIndex,
      vertexIndex: event.vertexIndex,
      segment: [event.vertex, event.otherEvent.vertex]
    }

    for (let i = 0; i < segmentList.data.length; i++) {
      const otherSegment = segmentList.data[i]
      if (isAdjoiningSegments(segment, otherSegment)) continue
      const intersection = findIntersection(segment.segment, otherSegment.segment)
      if (intersection !== undefined) intersectionPoints.push(intersection)
    }

    segmentList.push(segment)
  }
  return intersectionPoints
}

const locateIntersections = (lines: Line[]): Point[] => {
  const queue = new TinyQueue([], priority)
  fill(queue, lines)
  return sweep(queue)
}

export type { Point, Line, Segment, ActiveSegment, SweepEvent }
export default locateIntersections
