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

interface Intersection {
  point: Point
  segment1: ActiveSegment
  segment2: ActiveSegment
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

const fillSegmentEvents = (queue: TinyQueue<SweepEvent>, vertex, nextVertex, lineIndex, vertexIndex): void => {
  const event1: SweepEvent = {
    vertex,
    lineIndex,
    vertexIndex,
    isStart: sweepPriority(vertex, nextVertex) <= 0
  }
  const event2: SweepEvent = {
    vertex: nextVertex,
    lineIndex,
    vertexIndex,
    isStart: !event1.isStart,
    otherEvent: event1
  }
  event1.otherEvent = event2
  queue.push(event1)
  queue.push(event2)
}

const fillSegmentEvents2 = (queue: TinyQueue<SweepEvent>, lineIndex: number) => (nextVertex: Point, vertexIndex: number, line: Line): void => {
  if (vertexIndex === 0) return
  const vertex = line[vertexIndex - 1]
  const event1: SweepEvent = {
    vertex,
    lineIndex,
    vertexIndex,
    isStart: sweepPriority(vertex, nextVertex) <= 0
  }
  const event2: SweepEvent = {
    vertex: nextVertex,
    lineIndex,
    vertexIndex,
    isStart: !event1.isStart,
    otherEvent: event1
  }
  event1.otherEvent = event2
  queue.push(event1)
  queue.push(event2)
}

const fill = (queue: TinyQueue<SweepEvent>, lines: Line[]): void => {
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    lines[lineIndex].forEach(fillSegmentEvents2(queue, lineIndex))
  }
}

const calculateIntersection = (
  [[x1, y1], [x2, y2]]: Segment,
  [[x3, y3], [x4, y4]]: Segment
): Point | undefined => {
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

const handleSweepEvent = (
  event: SweepEvent | undefined,
  segmentList: TinyQueue<ActiveSegment>,
  intersections: Intersection[]
): void => {
  if (event?.otherEvent === undefined) return

  if (!event.isStart) {
    segmentList.pop()
    return
  }

  const segment1: ActiveSegment = {
    lineIndex: event.lineIndex,
    vertexIndex: event.vertexIndex,
    segment: [event.vertex, event.otherEvent.vertex]
  }

  segmentList.data.forEach((segment2: ActiveSegment): void => {
    if (isAdjoiningSegments(segment1, segment2)) return
    const point = calculateIntersection(segment1.segment, segment2.segment)
    if (point === undefined) return
    intersections.push({ point, segment1, segment2 })
  })

  segmentList.push(segment1)
}

const sweep = (eventQueue: TinyQueue<SweepEvent>): Intersection[] => {
  const intersections: Intersection[] = []
  const segmentList = new TinyQueue([], segmentEndPriority)
  while (eventQueue.length > 0) {
    handleSweepEvent(eventQueue.pop(), segmentList, intersections)
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
