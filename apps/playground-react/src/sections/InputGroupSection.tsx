import {type InputBoxProps, InputGroup} from '@tweeq/react'
import {type ButtonHTMLAttributes} from 'react'

interface GroupItemProps
	extends InputBoxProps,
		Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {}

function GroupItem({inlinePosition, blockPosition, ...props}: GroupItemProps) {
	return (
		<button
			{...props}
			data-block-position={blockPosition}
			data-inline-position={inlinePosition}
		/>
	)
}

export default function InputGroupSection() {
	return (
		<section data-testid="InputGroup">
			<h2>InputGroup</h2>
			<InputGroup>
				<GroupItem>A</GroupItem>
				<GroupItem>B</GroupItem>
				<GroupItem>C</GroupItem>
			</InputGroup>
		</section>
	)
}
