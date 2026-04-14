import type { JourneyAnswers, MonthValue } from '$lib/journey/types'

import type { TriageResult } from './types'

const MONTH_NUMBERS: Record<MonthValue, number> = {
	january: 1,
	february: 2,
	march: 3,
	april: 4,
	may: 5,
	june: 6,
	july: 7,
	august: 8,
	september: 9,
	october: 10,
	november: 11,
	december: 12
}

const parseResidenceStart = (answers: JourneyAnswers) => {
	if (!answers.residenceStart) {
		return null
	}

	const { yearBucket, month, monthUnknown } = answers.residenceStart

	switch (yearBucket) {
		case '2024_or_earlier':
			return { yearBucket, month: undefined, monthUnknown: false }
		case '2026':
			return { yearBucket, month: undefined, monthUnknown: false }
		case 'not_sure':
			return { yearBucket, month: undefined, monthUnknown: true }
		case '2025':
			return {
				yearBucket,
				month: month ? MONTH_NUMBERS[month] : undefined,
				monthUnknown: monthUnknown ?? false
			}
		default:
			return null
	}
}

export const runTriage = (answers: JourneyAnswers): TriageResult => {
	const flags = new Set<string>()
	const residenceStart = parseResidenceStart(answers)

	if (
		!residenceStart ||
		residenceStart.yearBucket === 'not_sure' ||
		(residenceStart.yearBucket === '2025' && residenceStart.monthUnknown)
	) {
		flags.add('uncertain_timeline')
	}

	if (residenceStart?.yearBucket === '2026') {
		return {
			resultState: 'another_route_may_fit_better',
			flags: ['hard_gate_after_cutoff'],
			explanation:
				'Based on your answers so far, this regularisation route may not be the best fit.',
			nextSteps: [
				'Ask a support organisation to review whether another immigration route fits better.',
				'Keep any documents that show your residence history in Spain.'
			],
			humanReviewRecommended: false
		}
	}

	if (flags.has('uncertain_timeline')) {
		return {
			resultState: 'not_enough_information_yet',
			flags: [...flags],
			explanation: 'There is not quite enough information yet to give a confident next step.',
			nextSteps: [
				'Try to confirm roughly when you started living in Spain.',
				'If you are unsure, ask a support organisation to help you review your timeline.'
			],
			humanReviewRecommended: false
		}
	}

	return {
		resultState: 'likely_in_scope',
		flags: [],
		explanation: 'Based on these first answers, you look broadly in scope for this triage route.',
		nextSteps: [
			'Continue the full screener when the remaining questions are available.',
			'Keep any documents that help show when you started living in Spain.'
		],
		humanReviewRecommended: false
	}
}
