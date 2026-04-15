import type { MessageKey } from './index'

export const ar = {
	'chrome.app_title': 'استبيان التسوية',
	'chrome.meta_description': 'استبيان أولي لعملية التسوية الاستثنائية في إسبانيا لعام 2026.',
	'chrome.brand': 'التسوية',
	'chrome.language_switcher_label': 'تبديل اللغة',
	'steps.language.title': 'اختر لغة',
	'steps.language.body': 'ما اللغة التي تود استخدامها؟',
	'steps.language.hint': 'يمكنك تغيير اللغة في أي وقت من دون فقدان إجاباتك.',
	'steps.language.check_answers_label': 'اللغة',
	'steps.language.error': 'اختر لغة.'
} satisfies Partial<Record<MessageKey, string>>
