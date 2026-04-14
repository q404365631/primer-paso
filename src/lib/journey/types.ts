export const MONTH_VALUES = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
] as const

export type MonthValue = (typeof MONTH_VALUES)[number]

export const MONTH_LABELS: Record<MonthValue, string> = Object.fromEntries(
	MONTH_VALUES.map((value) => [value, `${value.charAt(0).toUpperCase()}${value.slice(1)}`])
) as Record<MonthValue, string>

export const RESIDENCE_START_YEAR_BUCKETS = ['2024_or_earlier', '2025', '2026', 'not_sure'] as const

export type ResidenceStartYearBucket = (typeof RESIDENCE_START_YEAR_BUCKETS)[number]

export interface ResidenceStartAnswer {
	yearBucket: ResidenceStartYearBucket
	month?: MonthValue
	monthUnknown?: boolean
}

export interface JourneyAnswers {
	residenceStart?: ResidenceStartAnswer
}

export interface JourneyState {
	sessionId: string
	answers: JourneyAnswers
	updatedAt: string
}
