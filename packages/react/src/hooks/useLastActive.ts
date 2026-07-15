import {useEffect, useRef, useState} from 'react'

/** Return the key whose boolean most recently became true, or undefined. */
export function useLastActive<T extends string>(values: Record<T, boolean>) {
	const previous = useRef(values)
	const [active, setActive] = useState<T>()

	useEffect(() => {
		for (const key of Object.keys(values) as T[]) {
			if (values[key] && !previous.current[key]) setActive(key)
		}
		if (!(Object.keys(values) as T[]).some(key => values[key])) {
			setActive(undefined)
		}
		previous.current = values
	}, [values])

	return active
}
