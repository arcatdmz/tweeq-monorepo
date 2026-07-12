import {forwardRef, type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import styles from './ColorIcon.module.styl'

export interface ColorIconProps extends HTMLAttributes<HTMLDivElement> {
	src: string
}

export const ColorIcon = forwardRef<HTMLDivElement, ColorIconProps>(
	function ColorIconComponent({src, className, style, ...props}, ref) {
		return (
			<div
				{...props}
				ref={ref}
				className={classNames(styles.colorIcon, className)}
				style={{...style, maskImage: `url(${src})`}}
			/>
		)
	}
)
