import { redirect } from '@sveltejs/kit'
import { formatResidenceStartAnswer, getJourneyState } from '$lib/server/journey'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ cookies }) => {
	const state = getJourneyState(cookies)

	if (!state.answers.residenceStart) {
		redirect(303, '/residence-start')
	}

	return {
		answers: [
			{
				label: 'When you started living in Spain',
				value: formatResidenceStartAnswer(state.answers.residenceStart),
				changeHref: '/residence-start?returnTo=/check-answers'
			}
		]
	}
}
