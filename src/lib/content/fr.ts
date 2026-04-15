import type { MessageKey } from './index'

export const fr = {
	'chrome.app_title': 'Questionnaire de régularisation',
	'chrome.meta_description':
		"Un questionnaire d'accueil pour le processus extraordinaire de régularisation en Espagne en 2026.",
	'chrome.brand': 'Régularisation',
	'chrome.language_switcher_label': 'Changement de langue',
	'steps.language.title': 'Choisissez une langue',
	'steps.language.body': 'Quelle langue souhaitez-vous utiliser ?',
	'steps.language.hint': 'Vous pouvez changer de langue à tout moment sans perdre vos réponses.',
	'steps.language.check_answers_label': 'Langue',
	'steps.language.error': 'Choisissez une langue.'
} satisfies Partial<Record<MessageKey, string>>
