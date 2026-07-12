import {useState} from 'react'

import {useEventListener} from './useEventListener'

function readSize() {
	return typeof window === 'undefined'
		? {width: 0, height: 0}
		: {width: window.innerWidth, height: window.innerHeight}
}

export function useWindowSize() {
	const [size, setSize] = useState(readSize)
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'resize',
		() => setSize(readSize())
	)
	return size
}
