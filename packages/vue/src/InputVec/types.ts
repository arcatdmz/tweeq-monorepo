import {InputProps} from '../types'

export interface InputVecProps<T extends readonly number[]> extends InputProps {
	min?: T | number
	max?: T | number
	step?: T | number
	icon?: string[] | string
}
