import {appConfigStore} from '@tweeq/dom'
import {type HTMLAttributes, type ReactNode, useMemo, useState} from 'react'

import {useConfigRef} from '../../hooks'
import {Icon} from '../Icon'
import {ParameterHeading} from './ParameterHeading'

export interface ParameterGroupProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	label: string
	icon?: string
	headingRight?: ReactNode
}

export function ParameterGroup({
	name,
	label,
	icon,
	headingRight,
	children,
	className,
	...props
}: ParameterGroupProps) {
	const entry = useMemo(() => appConfigStore.getState().ref(name, true), [name])
	const [expanded, setExpanded] = useConfigRef(entry)
	const [clipped, setClipped] = useState(!expanded)

	return (
		<div
			{...props}
			className={className}
			data-tq-component="parameter-group"
			data-tq-collapsed={!expanded ? '' : undefined}
			data-tq-part="root"
			onTransitionEnd={event => {
				if (event.propertyName === 'grid-template-rows') setClipped(!expanded)
			}}
		>
			<ParameterHeading right={expanded ? headingRight : undefined}>
				<button
					type="button"
					aria-expanded={expanded}
					data-tq-part="trigger"
					onClick={() => {
						if (expanded) setClipped(true)
						setExpanded(!expanded)
					}}
				>
					<Icon data-tq-part="chevron" icon="mdi:chevron-down" />
					{icon && <Icon data-tq-part="group-icon" icon={icon} />}
					<span>{label}</span>
				</button>
			</ParameterHeading>
			<div
				data-tq-part="content"
				data-tq-clipped={clipped ? '' : undefined}
			>
				{children}
			</div>
		</div>
	)
}
