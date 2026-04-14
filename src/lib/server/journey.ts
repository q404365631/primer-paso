import type { Cookies } from '@sveltejs/kit'

import type {
	JourneyAnswers,
	JourneyState,
	MonthValue,
	ResidenceStartAnswer,
	ResidenceStartYearBucket
} from '$lib/journey/types'

import { MONTH_LABELS, MONTH_VALUES, RESIDENCE_START_YEAR_BUCKETS } from '$lib/journey/types'

const JOURNEY_COOKIE = 'ri_journey'
const THIRTY_DAYS = 60 * 60 * 24 * 30

const safeRelativePath = (value: string | null, fallback: string) => {
	if (!value || !value.startsWith('/') || value.startsWith('//')) {
		return fallback
	}

	return value
}

const createEmptyState = (): JourneyState => ({
	sessionId: crypto.randomUUID(),
	answers: {},
	updatedAt: new Date().toISOString()
})

const isResidenceStartYearBucket = (value: unknown): value is ResidenceStartYearBucket =>
	typeof value === 'string' &&
	RESIDENCE_START_YEAR_BUCKETS.includes(value as ResidenceStartYearBucket)

const isMonthValue = (value: unknown): value is MonthValue =>
	typeof value === 'string' && MONTH_VALUES.includes(value as MonthValue)

const isResidenceStartAnswer = (value: unknown): value is ResidenceStartAnswer => {
	if (!value || typeof value !== 'object') {
		return false
	}

	const candidate = value as Record<string, unknown>

	return (
		isResidenceStartYearBucket(candidate.yearBucket) &&
		(candidate.month === undefined || isMonthValue(candidate.month)) &&
		(candidate.monthUnknown === undefined || typeof candidate.monthUnknown === 'boolean')
	)
}

const isJourneyState = (value: unknown): value is JourneyState => {
	if (!value || typeof value !== 'object') {
		return false
	}

	const candidate = value as Record<string, unknown>
	const answers = (candidate.answers ?? {}) as Record<string, unknown>

	return (
		typeof candidate.sessionId === 'string' &&
		typeof candidate.updatedAt === 'string' &&
		(candidate.answers === undefined || typeof candidate.answers === 'object') &&
		(answers.residenceStart === undefined || isResidenceStartAnswer(answers.residenceStart))
	)
}

export const getJourneyState = (cookies: Cookies) => {
	const raw = cookies.get(JOURNEY_COOKIE)

	if (!raw) {
		return createEmptyState()
	}

	try {
		const parsed = JSON.parse(raw)

		return isJourneyState(parsed) ? parsed : createEmptyState()
	} catch {
		return createEmptyState()
	}
}

export const setJourneyState = (cookies: Cookies, state: JourneyState) => {
	cookies.set(JOURNEY_COOKIE, JSON.stringify(state), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		maxAge: THIRTY_DAYS
	})
}

export const updateJourneyAnswers = (cookies: Cookies, answers: Partial<JourneyAnswers>) => {
	const current = getJourneyState(cookies)

	const next: JourneyState = {
		...current,
		answers: {
			...current.answers,
			...answers
		},
		updatedAt: new Date().toISOString()
	}

	setJourneyState(cookies, next)

	return next
}

export const clearJourneyState = (cookies: Cookies) => {
	cookies.delete(JOURNEY_COOKIE, {
		path: '/'
	})
}

export const formatResidenceStartAnswer = (value?: ResidenceStartAnswer) => {
	if (!value) {
		return 'Not answered'
	}

	switch (value.yearBucket) {
		case '2024_or_earlier':
			return '2024 or earlier'
		case '2026':
			return '2026'
		case 'not_sure':
			return "I'm not sure"
		case '2025':
			if (value.monthUnknown) {
				return '2025 — month not sure'
			}

			return value.month ? `${MONTH_LABELS[value.month]} 2025` : '2025'
		default:
			return 'Not answered'
	}
}

export const getSafeReturnTo = (url: URL, fallback: string) =>
	safeRelativePath(url.searchParams.get('returnTo'), fallback)

export const resolveReturnTo = (candidate: FormDataEntryValue | null, fallback: string) =>
	safeRelativePath(typeof candidate === 'string' ? candidate : null, fallback)
