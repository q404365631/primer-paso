import { getTextDirection, resolveLocale } from '$lib/content'
import { getJourneyState } from '$lib/server/journey'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ cookies, url }) => {
	const state = getJourneyState(cookies)
	const locale = resolveLocale(state.answers.language)
	const currentPath =
		url.pathname === '/language'
			? url.searchParams.get('returnTo') || '/start'
			: `${url.pathname}${url.search}`

	return {
		locale,
		textDirection: getTextDirection(locale),
		currentPath
	}
}
