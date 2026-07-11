import {useMemo, useRef} from 'react'

import {type ValidateResult, type Validator} from '../../core'

export interface ValidatorResult<T> {
	validLocal: T | undefined
	validateResult: ValidateResult<T>
}

/**
 * Validate during render and synchronously retain the last valid value. This
 * intentionally avoids an effect so model/local/display loops never see a
 * stale validation frame.
 */
export function useValidator<T>(
	local: T,
	validator: Validator<T>
): ValidatorResult<T> {
	const validateResult = useMemo(() => validator(local), [local, validator])
	const validLocal = useRef<T | undefined>(undefined)

	if (validateResult.value !== undefined) {
		validLocal.current = validateResult.value
	}

	return {validLocal: validLocal.current, validateResult}
}
