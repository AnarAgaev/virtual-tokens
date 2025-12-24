import {useCallback} from 'react'
import {useComposition} from '@/store'

export const useCountHandlers = () => {
	const updateComplectCount = useComposition(
		(store) => store.updateComplectCount,
	)

	const onButtonInc = useCallback(
		() => updateComplectCount({direction: 1}),
		[updateComplectCount],
	)
	const onButtonDec = useCallback(
		() => updateComplectCount({direction: -1}),
		[updateComplectCount],
	)

	return {onButtonInc, onButtonDec}
}
