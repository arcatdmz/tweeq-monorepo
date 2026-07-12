import {appConfigStore} from '@tweeq/dom'
import {type HTMLAttributes, type ReactNode, useMemo, useState} from 'react'

import {classNames} from '../../classNames'
import {useConfigRef} from '../../hooks'
import {Icon} from '../Icon'
import styles from './ParameterGroup.module.styl'
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
			className={classNames(
				styles.group,
				!expanded && styles.collapsed,
				className
			)}
			data-tq-part="root"
			onTransitionEnd={event => {
				if (event.propertyName === 'grid-template-rows') setClipped(!expanded)
			}}
		>
			<ParameterHeading right={expanded ? headingRight : undefined}>
				<button
					type="button"
					className={styles.heading}
					aria-expanded={expanded}
					data-tq-part="trigger"
					onClick={() => {
						if (expanded) setClipped(true)
						setExpanded(!expanded)
					}}
				>
					<Icon className={styles.chevron} icon="mdi:chevron-down" />
					{icon && <Icon className={styles.groupIcon} icon={icon} />}
					<span>{label}</span>
				</button>
			</ParameterHeading>
			<div className={classNames(styles.content, clipped && styles.clipped)}>
				{children}
			</div>
		</div>
	)
}
