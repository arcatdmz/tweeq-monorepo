import {useTweeqRuntime} from '../../runtime'
import {IconIndicator} from '../IconIndicator'

export function MultiSelectButton({
	icon,
	update,
}: {
	icon: string
	update: (values: number[]) => number[]
}) {
	const {multiSelectStore} = useTweeqRuntime()
	const edit = () => {
		multiSelectStore.getState().updateValues(update)
		multiSelectStore.getState().confirmValues()
	}

	return (
		<IconIndicator
			data-tq-multi-select-action="button"
			data-tq-part="button"
			icon={icon}
			onChangeActive={edit}
		/>
	)
}
