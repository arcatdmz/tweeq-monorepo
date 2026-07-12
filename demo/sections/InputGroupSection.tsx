import {type ButtonHTMLAttributes} from 'react'

import {type InputBoxProps, InputGroup} from '../../src/react'

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
