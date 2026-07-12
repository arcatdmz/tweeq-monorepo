import PQueue from 'p-queue'
import createRegl, {type DrawConfig, type Regl} from 'regl'

export type GlslUniforms = Record<string, number | number[] | readonly number[]>

const drawQueue = new PQueue({concurrency: 1})
const latestWork = new WeakMap<HTMLImageElement, number>()
let workId = 0
let canvas: HTMLCanvasElement | undefined
let regl: Regl | undefined

const QUAD: DrawConfig = {
	vert: `
		precision mediump float;
		attribute vec2 position;
		varying vec2 uv;
		void main() {
			uv = position / 2.0 + 0.5;
			gl_Position = vec4(position, 0, 1);
		}`,
	attributes: {position: [-1, -1, 1, -1, -1, 1, 1, 1]},
	depth: {enable: false},
	count: 4,
	primitive: 'triangle strip',
}

function getContext(): {canvas: HTMLCanvasElement; regl: Regl} | undefined {
	if (typeof document === 'undefined') return
	if (!canvas) canvas = document.createElement('canvas')
	if (!regl) {
		regl = createRegl({
			canvas,
			attributes: {depth: false, premultipliedAlpha: false},
		})
	}
	return {canvas, regl}
}

/** Queue a draw on the shared offscreen WebGL canvas. Newer work wins. */
export function drawGlslToImage(
	image: HTMLImageElement,
	fragmentString: string,
	uniforms: GlslUniforms
): () => void {
	const id = ++workId
	latestWork.set(image, id)

	void drawQueue
		.add(async () => {
			if (latestWork.get(image) !== id || !image.isConnected) return
			const context = getContext()
			if (!context) return
			const width = Math.max(1, Math.round(image.clientWidth))
			const height = Math.max(1, Math.round(image.clientHeight))
			context.canvas.width = width
			context.canvas.height = height
			context.regl({
				...QUAD,
				frag: fragmentString,
				viewport: {x: 0, y: 0, width, height},
				uniforms,
			})()
			if (latestWork.get(image) === id) image.src = context.canvas.toDataURL()
		})
		.catch(() => {
			// WebGL may be disabled; leave the image empty rather than breaking UI.
		})

	return () => {
		if (latestWork.get(image) === id) latestWork.delete(image)
	}
}
