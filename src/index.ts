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

interface VertexLocation {
  lineIndex: number
  vertexIndex: number
}

interface Intersection {
  point: Point
  line1: VertexLocation
  line2: VertexLocation
}

const sweepPriority = ([x1, y1]: Point, [x2, y2]: Point): 1 | 0 | -1 => {
  if (x1 > x2) return 1
  if (x1 < x2) return -1
  if (y1 === y2) return 0
  return y1 > y2 ? 1 : -1
}

const eventPriority = (e1: SweepEvent, e2: SweepEvent): 1 | 0 | -1 =>
  sweepPriority(e1.vertex, e2.vertex)

const segmentEndPriority = (a: ActiveSegment, b: ActiveSegment): 1 | 0 | -1 =>
  sweepPriority(a.segment[1], b.segment[1])

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

      if (eventPriority(e1, e2) > 0) {
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

const isAdjoiningSegments = (a: ActiveSegment, b: ActiveSegment): boolean => {
  if (a.lineIndex !== b.lineIndex) return false
  return Math.abs(a.vertexIndex - b.vertexIndex) <= 1
}

const handleSweepEvent = (event: SweepEvent, segmentList: TinyQueue<ActiveSegment>, intersections: Intersection[]): void => {
  if (event.otherEvent === undefined) return undefined
  console.log('eventQueue', event.lineIndex, event.vertexIndex, event.isStart ? 'str' : 'end', event.vertex, '->', event.otherEvent.vertex)

  if (!event.isStart) {
    segmentList.pop()
    return undefined
  }

  const segment: ActiveSegment = {
    lineIndex: event.lineIndex,
    vertexIndex: event.vertexIndex,
    segment: [event.vertex, event.otherEvent.vertex]
  }

  for (let i = 0; i < segmentList.data.length; i++) {
    const otherSegment = segmentList.data[i]
    if (isAdjoiningSegments(segment, otherSegment)) continue
    const intersectionPoint = findIntersection(segment.segment, otherSegment.segment)
    if (intersectionPoint !== undefined) {
      const intersection: Intersection = {
        point: intersectionPoint,
        line1: { lineIndex: segment.lineIndex, vertexIndex: segment.vertexIndex },
        line2: { lineIndex: otherSegment.lineIndex, vertexIndex: otherSegment.vertexIndex }
      }
      intersections.push(intersection)
    }
  }

  segmentList.push(segment)
}

const sweep = (eventQueue: TinyQueue<SweepEvent>): Intersection[] => {
  const intersections: Intersection[] = []
  const segmentList = new TinyQueue([], segmentEndPriority)

  while (eventQueue.length > 0) {
    const event = eventQueue.pop()
    if (event === undefined) break
    handleSweepEvent(event, segmentList, intersections)
  }
  return intersections
}

const locateIntersections = (lines: Line[]): Intersection[] => {
  const queue = new TinyQueue([], eventPriority)
  fill(queue, lines)
  return sweep(queue)
}

export type { Point, Line, Segment, ActiveSegment, SweepEvent }
export default locateIntersections
