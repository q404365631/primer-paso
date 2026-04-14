import { redirect } from '@sveltejs/kit'
import { getJourneyState } from '$lib/server/journey'
import { runTriage } from '$lib/triage/engine'
import type { PageServerLoad } from './$types'

const resultTitle = {
	likely_in_scope: 'Likely in scope',
	needs_specialist_review: 'Needs specialist review',
	another_route_may_fit_better: 'Another route may fit better',
	not_enough_information_yet: 'Not enough information yet'
} as const

export const load: PageServerLoad = ({ cookies }) => {
	const state = getJourneyState(cookies)

	if (!state.answers.residenceStart) {
		redirect(303, '/residence-start')
	}

	const result = runTriage(state.answers)

	return {
		result: { ...result, title: resultTitle[result.resultState] },
		sessionId: state.sessionId
	}
}
