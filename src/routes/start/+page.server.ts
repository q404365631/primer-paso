import { resolveLocale } from '$lib/content'
import { clearJourneyState, getJourneyState } from '$lib/server/journey'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ cookies, url }) => {
	if (url.searchParams.get('new') === '1') {
		clearJourneyState(cookies)
	}

	const state = getJourneyState(cookies)

	return { locale: resolveLocale(state.answers.language) }
}
