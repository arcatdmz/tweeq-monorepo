import {
	Children,
	cloneElement,
	forwardRef,
	Fragment,
	type HTMLAttributes,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react'

import {type InputBoxProps, type InputPosition} from '../../../core'
import {classNames} from '../../classNames'
import styles from './InputGroup.module.styl'

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
	direction?: 'horizontal' | 'vertical'
	/**
	 * Every element child must accept and forward `inlinePosition` and
	 * `blockPosition` to its root DOM element.
	 */
	children?: ReactNode
}

function flattenChildren(children: ReactNode): ReactNode[] {
	const output: ReactNode[] = []

	Children.forEach(children, child => {
		if (typeof child === 'string' && child.trim() === '') return
		if (isValidElement(child) && child.type === Fragment) {
			output.push(
				...flattenChildren(
					(child as ReactElement<{children?: ReactNode}>).props.children
				)
			)
			return
		}
		output.push(child)
	})

	return output
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
	function InputGroupComponent(
		{direction = 'horizontal', children, className, ...props},
		forwardedRef
	) {
		const flattened = flattenChildren(children)
		const elementCount = flattened.filter(isValidElement).length
		let elementIndex = 0
		const positionProp =
			direction === 'vertical' ? 'blockPosition' : 'inlinePosition'

		const positioned = flattened.map((child, i) => {
			if (!isValidElement(child) || elementCount <= 1) return child

			const position: InputPosition =
				elementIndex === 0
					? 'start'
					: elementIndex === elementCount - 1
						? 'end'
						: 'middle'
			elementIndex += 1

			// Flattening turns static JSX children into an array, so React
			// requires keys; fall back to the array index for keyless children.
			return cloneElement(child as ReactElement<InputBoxProps>, {
				key: child.key ?? i,
				[positionProp]: position,
			})
		})

		return (
			<div
				{...props}
				ref={forwardedRef}
				className={classNames(styles.tqInputGroup, className)}
				data-direction={direction}
			>
				{positioned}
			</div>
		)
	}
)
