import {forwardRef, type HTMLAttributes} from 'react'


export interface ColorIconProps extends HTMLAttributes<HTMLDivElement> {
	src: string
}

export const ColorIcon = forwardRef<HTMLDivElement, ColorIconProps>(
	function ColorIconComponent({src, className, style, ...props}, ref) {
		return (
			<div
				{...props}
				ref={ref}
				className={className}
				data-tq-component="color-icon"
				data-tq-part="root"
				style={{...style, maskImage: `url(${src})`}}
			/>
		)
	}
)
