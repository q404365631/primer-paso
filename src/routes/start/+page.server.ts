import { clearJourneyState } from '$lib/server/journey'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ cookies, url }) => {
	if (url.searchParams.get('new') === '1') {
		clearJourneyState(cookies)
	}
	return {}
}
