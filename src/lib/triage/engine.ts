import type { MessageKey } from '$lib/content'
import type {
	EvidenceBeforeCutoffValue,
	EvidenceRecentValue,
	JourneyAnswers,
	MonthValue
} from '$lib/journey/types'

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

const hasAnyStrongBeforeCutoffEvidence = (values: EvidenceBeforeCutoffValue[] = []) =>
	values.some((value) =>
		[
			'padron_or_registration',
			'housing_papers',
			'health_or_pharmacy',
			'school_or_childcare',
			'work_papers'
		].includes(value)
	)

const hasAnyStrongRecentEvidence = (values: EvidenceRecentValue[] = []) =>
	values.some((value) =>
		[
			'housing_papers',
			'health_or_pharmacy',
			'school_or_childcare',
			'work_papers',
			'bank_or_money_transfer'
		].includes(value)
	)

export const runTriage = (answers: JourneyAnswers): TriageResult => {
	const flags = new Set<MessageKey>()
	const residenceStart = parseResidenceStart(answers)
	const inSpainNow = answers.inSpainNow
	const asylumBeforeCutoff = answers.asylumBeforeCutoff
	const fiveMonthStay = answers.fiveMonthStay
	const asylumCaseDocuments = answers.asylumCaseDocuments
	const identityDocuments = answers.identityDocuments ?? []
	const evidenceBeforeCutoff = answers.evidenceBeforeCutoff ?? []
	const evidenceRecentMonths = answers.evidenceRecentMonths ?? []
	const specialistFlags = answers.specialistFlags ?? []

	const hasStrongEvidence =
		hasAnyStrongBeforeCutoffEvidence(evidenceBeforeCutoff) &&
		hasAnyStrongRecentEvidence(evidenceRecentMonths)

	const evidenceStrength =
		evidenceBeforeCutoff.length === 0 || evidenceRecentMonths.length === 0
			? 'unknown'
			: hasStrongEvidence
				? 'strong'
				: 'thin'

	if (inSpainNow === 'no') {
		return {
			resultState: 'another_route_may_fit_better',
			flags: ['result.flag.not_in_spain_now'],
			reasonKey: 'result.reason.not_in_spain_now',
			evidenceStrength,
			showHowToApply: false,
			showSupportCta: true,
			showDocumentCta: false,
			explanationKey: 'result.explanation.not_in_spain_now',
			nextStepKeys: ['result.next_step.other_route_advice', 'result.next_step.try_again_later'],
			humanReviewRecommended: false
		}
	}

	if (
		inSpainNow === 'not_sure' ||
		!residenceStart ||
		residenceStart.yearBucket === 'not_sure' ||
		(residenceStart.yearBucket === '2025' && residenceStart.monthUnknown) ||
		asylumBeforeCutoff === 'not_sure' ||
		fiveMonthStay === 'not_sure'
	) {
		flags.add('result.flag.uncertain_timeline')
	}

	if (fiveMonthStay === 'no') {
		flags.add('result.flag.five_month_requirement_risk')
	}

	if (residenceStart?.yearBucket === '2026') {
		return {
			resultState: 'another_route_may_fit_better',
			flags: ['result.flag.hard_gate_after_cutoff'],
			reasonKey: 'result.reason.after_cutoff',
			evidenceStrength,
			showHowToApply: false,
			showSupportCta: true,
			showDocumentCta: false,
			explanationKey: 'result.explanation.after_cutoff',
			nextStepKeys: [
				'result.next_step.other_route_advice',
				'result.next_step.keep_residence_documents'
			],
			humanReviewRecommended: false
		}
	}

	if (
		specialistFlags.includes('criminal_record_worry') ||
		specialistFlags.includes('identity_missing_or_mismatch') ||
		specialistFlags.includes('asylum_case_not_clear') ||
		specialistFlags.includes('want_specialist') ||
		identityDocuments.includes('no_identity_documents_now') ||
		fiveMonthStay === 'no' ||
		(asylumBeforeCutoff === 'yes' && asylumCaseDocuments !== 'yes')
	) {
		return {
			resultState: 'needs_specialist_review',
			flags: [
				...flags,
				...(specialistFlags.includes('criminal_record_worry')
					? (['result.flag.criminal_record_concern'] as MessageKey[])
					: []),
				...(specialistFlags.includes('identity_missing_or_mismatch')
					? (['result.flag.identity_issue'] as MessageKey[])
					: []),
				...(specialistFlags.includes('asylum_case_not_clear')
					? (['result.flag.asylum_complexity'] as MessageKey[])
					: []),
				...(identityDocuments.includes('no_identity_documents_now')
					? (['result.flag.missing_identity_documents'] as MessageKey[])
					: []),
				...(fiveMonthStay === 'no' ? (['result.flag.continuity_concern'] as MessageKey[]) : [])
			],
			reasonKey: 'result.reason.specialist_review',
			evidenceStrength,
			showHowToApply: false,
			showSupportCta: true,
			showDocumentCta: false,
			explanationKey: 'result.explanation.specialist_review',
			nextStepKeys: [
				'result.next_step.speak_to_specialist',
				'result.next_step.keep_papers_together'
			],
			humanReviewRecommended: true
		}
	}

	if (flags.has('result.flag.uncertain_timeline')) {
		return {
			resultState: 'not_enough_information_yet',
			flags: [...flags],
			reasonKey: 'result.reason.not_enough_information',
			evidenceStrength,
			showHowToApply: false,
			showSupportCta: true,
			showDocumentCta: false,
			explanationKey: 'result.explanation.not_enough_information',
			nextStepKeys: [
				'result.next_step.confirm_timeline',
				'result.next_step.ask_for_help_if_unsure'
			],
			humanReviewRecommended: false
		}
	}

	if (
		evidenceStrength === 'thin' ||
		evidenceBeforeCutoff.includes('none_yet') ||
		evidenceRecentMonths.includes('none_yet')
	) {
		return {
			resultState: 'possible_but_needs_more_evidence',
			flags: [],
			reasonKey: 'result.reason.more_evidence',
			evidenceStrength,
			showHowToApply: true,
			showSupportCta: true,
			showDocumentCta: true,
			explanationKey: 'result.explanation.more_evidence',
			nextStepKeys: ['result.next_step.gather_before_cutoff', 'result.next_step.gather_recent'],
			humanReviewRecommended: false
		}
	}

	return {
		resultState: 'likely_in_scope',
		flags: [],
		reasonKey: 'result.reason.likely_in_scope',
		evidenceStrength,
		showHowToApply: true,
		showSupportCta: true,
		showDocumentCta: false,
		explanationKey: 'result.explanation.likely_in_scope',
		nextStepKeys: [
			'result.next_step.keep_papers_together',
			'result.next_step.use_official_channel'
		],
		humanReviewRecommended: false
	}
}
