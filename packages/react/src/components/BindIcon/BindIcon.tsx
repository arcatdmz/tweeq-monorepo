import {type IconSequence} from 'bndr-js'
import {type HTMLAttributes} from 'react'

import {Icon} from '../Icon'

export interface BindIconProps extends HTMLAttributes<HTMLDivElement> {
	icon: IconSequence
}

export function BindIcon({icon, className, ...props}: BindIconProps) {
	return (
		<div
			className={className}
			data-tq-part="root"
			{...props}
			data-tq-component="bind-icon"
		>
			{icon.map((entry, index) =>
				typeof entry === 'string' ? (
					<span key={index}>{entry}</span>
				) : (
					<Icon key={index} icon={entry.icon} data-tq-part="icon" />
				)
			)}
		</div>
	)
}
