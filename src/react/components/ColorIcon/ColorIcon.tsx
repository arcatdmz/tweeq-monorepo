import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import styles from './ColorIcon.module.styl'

export interface ColorIconProps extends HTMLAttributes<HTMLDivElement> {
	src: string
}

export function ColorIcon({src, className, style, ...props}: ColorIconProps) {
	return (
		<div
			{...props}
			className={classNames(styles.colorIcon, className)}
			style={{...style, maskImage: `url(${src})`}}
		/>
	)
}
