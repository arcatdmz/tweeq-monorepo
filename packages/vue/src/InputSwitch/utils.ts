import {getSwitchKeyValue, getSwitchTweakValue} from '@tweeq/core'
import {useEventListener, useFocus} from '@vueuse/core'
import {computed, Ref, toRef, watch} from 'vue'

import {InputCheckboxProps} from '../InputCheckbox/types'
import {useMultiSelectStore} from '../stores/multiSelect'
import {useDrag} from '../use/useDrag'
export function useInputSwitch({
	track,
	input,
	props,
	emit,
}: {
	track: Ref<HTMLElement | null>
	input: Ref<HTMLInputElement | null>
	props: Pick<InputCheckboxProps, 'modelValue' | 'disabled'>
	emit: any
}) {
	const tweakThreshold = 3
	let valueOnTweak: boolean | null = null

	const {focused} = useFocus(input)

	const {dragging, initial, xy} = useDrag(track, {
		disabled: toRef(() => props.disabled ?? false),
		dragDelaySeconds: 0.2,
		onClick() {
			if (!multi.readyToBeSelected) {
				emit('update:modelValue', !props.modelValue)
				multi.update(value => !value)
			}

			emit('confirm')
			input.value?.focus()
		},
		onDragStart() {
			emit('focus')
			valueOnTweak = props.modelValue
		},
		onDragEnd() {
			emit('confirm')
			input.value?.focus()
		},
	})

	const tweakingValue = computed(() =>
		getSwitchTweakValue({
			dragging: dragging.value,
			initialX: initial.value[0],
			currentX: xy.value[0],
			valueOnTweak: valueOnTweak ?? false,
			threshold: tweakThreshold,
		})
	)

	watch(tweakingValue, value => {
		if (value === null) return
		multi.update(() => value)
		emit('update:modelValue', value)
	})

	useEventListener(input, 'keydown', (e: KeyboardEvent) => {
		const value = getSwitchKeyValue(e.key, props.modelValue)
		if (value === undefined) return

		e.preventDefault()
		// The switch consumed the key (e.g. "m"); don't also let it trigger an
		// app-wide shortcut bound to the same key.
		e.stopPropagation()
		emit('update:modelValue', value)
		emit('confirm')
	})

	useEventListener(input, 'input', () => {
		const value = input.value!.checked
		emit('update:modelValue', value)
		emit('confirm')
	})

	useEventListener(input, 'focus', (e: FocusEvent) => {
		// Only emit focus event when the focus is triggered by the keyboard
		if (e.relatedTarget !== null) {
			emit('focus')
		}
	})

	useEventListener(input, 'blur', () => emit('blur'))

	// Multi Select

	const multi = useMultiSelectStore().register({
		type: 'boolean',
		el: track,
		focusing: focused,
		getValue: () => props.modelValue,
		setValue(value) {
			emit('update:modelValue', value)
		},
		confirm() {
			emit('confirm')
		},
	})

	return {
		tweakingValue,
		subfocus: toRef(multi, 'subfocus'),
	}
}
