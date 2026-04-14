import { describe, expect, it } from 'vitest'

import { runTriage } from './engine'

describe('runTriage', () => {
	it('routes out when the residence start is after the cutoff', () => {
		const result = runTriage({
			residenceStart: {
				yearBucket: '2026'
			}
		})

		expect(result.resultState).toBe('another_route_may_fit_better')
	})

	it('returns not enough information when the core timeline is uncertain', () => {
		const result = runTriage({
			residenceStart: {
				yearBucket: 'not_sure'
			}
		})

		expect(result.resultState).toBe('not_enough_information_yet')
		expect(result.flags).toContain('uncertain_timeline')
	})

	it('returns not enough information when the year is 2025 but the month is not sure', () => {
		const result = runTriage({
			residenceStart: {
				yearBucket: '2025',
				monthUnknown: true
			}
		})

		expect(result.resultState).toBe('not_enough_information_yet')
	})

	it('returns likely in scope for 2024 or earlier', () => {
		const result = runTriage({
			residenceStart: { yearBucket: '2024_or_earlier' }
		})

		expect(result.resultState).toBe('likely_in_scope')
	})

	it('returns likely in scope for a 2025 answer with a valid month', () => {
		const result = runTriage({
			residenceStart: {
				yearBucket: '2025',
				month: 'november'
			}
		})

		expect(result.resultState).toBe('likely_in_scope')
	})
})
