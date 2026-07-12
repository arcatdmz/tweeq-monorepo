import {
	forwardRef,
	type ImgHTMLAttributes,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react'

import {drawGlslToImage, type GlslUniforms} from '../../../core'
import {classNames} from '../../classNames'
import {useResizeObserver} from '../../hooks'
import styles from './GlslCanvas.module.styl'

const DEFAULT_FRAGMENT = `
	precision mediump float;
	varying vec2 uv;
	void main() { gl_FragColor = vec4(uv, 0, 1); }
`

export interface GlslCanvasProps
	extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	fragmentString?: string
	uniforms?: GlslUniforms
}

export const GlslCanvas = forwardRef<HTMLImageElement, GlslCanvasProps>(
	function GlslCanvasComponent(
		{
			fragmentString = DEFAULT_FRAGMENT,
			uniforms = {},
			className,
			alt = '',
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
				className={classNames(styles.glslCanvas, className)}
			/>
		)
	}
)
