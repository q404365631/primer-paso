export type ResultState =
	| 'likely_in_scope'
	| 'needs_specialist_review'
	| 'another_route_may_fit_better'
	| 'not_enough_information_yet'

export interface TriageResult {
	resultState: ResultState
	flags: string[]
	explanation: string
	nextSteps: string[]
	humanReviewRecommended: boolean
}
