import {forwardRef, type HTMLAttributes} from 'react'


export interface ColorIconProps extends HTMLAttributes<HTMLDivElement> {
	src: string
	'data-tq-part'?: string
}

export const ColorIcon = forwardRef<HTMLDivElement, ColorIconProps>(
	function ColorIconComponent(
		{src, className, style, 'data-tq-part': part = 'root', ...props},
		ref
	) {
		return (
			<div
				{...props}
				ref={ref}
				className={className}
				data-tq-component="color-icon"
				data-tq-part={part}
				style={{...style, maskImage: `url(${src})`}}
			/>
		)
	}
)
