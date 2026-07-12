import {multiSelectStore} from '@tweeq/dom'

import {IconIndicator} from '../IconIndicator'
import styles from './MultiSelectPopup.module.styl'

export function MultiSelectButton({
	icon,
	update,
}: {
	icon: string
	update: (values: number[]) => number[]
}) {
	return (
		<IconIndicator
			className={styles.button}
			data-tq-part="button"
			icon={icon}
			onClick={() => {
				multiSelectStore.getState().updateValues(update)
				multiSelectStore.getState().confirmValues()
			}}
		/>
	)
}
