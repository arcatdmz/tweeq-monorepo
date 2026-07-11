import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import styles from './InputSwitchOverlay.module.styl'

export interface InputSwitchOverlayProps {
	value: boolean | null
}

export function InputSwitchOverlay({value}: InputSwitchOverlayProps) {
	if (value === null) return null

	return (
		<div className={styles.overlay}>
			<Icon
				className={classNames(styles.icon, styles.off, !value && styles.active)}
				icon="ic:baseline-radio-button-unchecked"
			/>
			<Icon
				className={classNames(styles.icon, styles.on, value && styles.active)}
				icon="ic:baseline-check-circle"
			/>
		</div>
	)
}
