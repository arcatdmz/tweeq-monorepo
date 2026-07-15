import {drawGlslToImage, type GlslUniforms} from '@tweeq/dom'
import {
	forwardRef,
	type ImgHTMLAttributes,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react'

import {useResizeObserver} from '../../hooks'

const DEFAULT_FRAGMENT = `
	precision mediump float;
	varying vec2 uv;
	void main() { gl_FragColor = vec4(uv, 0, 1); }
`

export interface GlslCanvasProps
	extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	fragmentString?: string
	uniforms?: GlslUniforms
	'data-tq-component'?: string
	'data-tq-part'?: string
}

export const GlslCanvas = forwardRef<HTMLImageElement, GlslCanvasProps>(
	function GlslCanvasComponent(
		{
			fragmentString = DEFAULT_FRAGMENT,
			uniforms = {},
			className,
			alt = '',
			'data-tq-component': dataTqComponent = 'glsl-canvas',
			'data-tq-part': dataTqPart = 'image',
			...props
		},
		forwardedRef
	) {
		const image = useRef<HTMLImageElement>(null)
		useImperativeHandle(forwardedRef, () => image.current!, [])
		useResizeObserver(image, () => {
			const element = image.current
			if (element) drawGlslToImage(element, fragmentString, uniforms)
		})

		useEffect(() => {
			const element = image.current
			if (!element) return
			return drawGlslToImage(element, fragmentString, uniforms)
		}, [fragmentString, uniforms])

		return (
			<img
				{...props}
				ref={image}
				alt={alt}
				className={className}
				data-tq-component={dataTqComponent}
				data-tq-part={dataTqPart}
			/>
		)
	}
)
