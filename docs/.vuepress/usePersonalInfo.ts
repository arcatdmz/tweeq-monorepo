import {ref} from 'vue'

const name = ref('')

export function usePersonalInfo() {
	return {name}
}
