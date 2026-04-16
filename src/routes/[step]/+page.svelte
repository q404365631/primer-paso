<script lang="ts">
import FormField from '$lib/components/forms/FormField.svelte'
import ChoiceGroup from '$lib/components/questions/ChoiceGroup.svelte'
import QuestionPage from '$lib/components/questions/QuestionPage.svelte'
import { Label } from '$lib/components/ui/label'
import { NativeSelect, NativeSelectOption } from '$lib/components/ui/native-select'
import { getTranslator } from '$lib/content'
import { MONTH_VALUES } from '$lib/journey/types'

let { data, form } = $props()

const locale = $derived(data.locale ?? 'es')
const tt = $derived(getTranslator(locale))
const monthId = 'residence-start-month'
const monthUnknownId = 'monthUnknown'
const provinceId = $derived(`${data.step.field}-select`)
const contactValueId = 'contactValue'

type ResidenceStartFormValue = {
	yearBucket: string
	month: string
	monthUnknown: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const rawValue = $derived(form?.value ?? data.value)
const distinctBody = $derived(
	data.step.body && data.step.body !== data.step.title ? data.step.body : undefined
)
const currentError = $derived(form?.error)

const scalarValue = $derived(typeof rawValue === 'string' ? rawValue : '')
const multiValue = $derived(
	Array.isArray(rawValue)
		? rawValue.filter((entry): entry is string => typeof entry === 'string')
		: []
)

const residenceValue = $derived.by<ResidenceStartFormValue>(() => {
	if (!isRecord(rawValue)) {
		return { yearBucket: '', month: '', monthUnknown: false }
	}

	const candidate = rawValue

	return {
		yearBucket: typeof candidate.yearBucket === 'string' ? candidate.yearBucket : '',
		month: typeof candidate.month === 'string' ? candidate.month : '',
		monthUnknown: Boolean(candidate.monthUnknown)
	}
})

const showMonthField = $derived(
	data.step.adapter === 'residence-start' && residenceValue.yearBucket === '2025'
)

const residenceOptions = $derived([
	{
		value: '2024_or_earlier',
		label: tt('steps.residence_start.options.2024_or_earlier')
	},
	{ value: '2025', label: tt('steps.residence_start.options.2025') },
	{ value: '2026', label: tt('steps.residence_start.options.2026') },
	{ value: 'not_sure', label: tt('steps.residence_start.options.not_sure') }
])

const contactValue = $derived.by(() => {
	if (!isRecord(rawValue)) {
		return { contactMethod: '', contactValue: '' }
	}

	return {
		contactMethod: typeof rawValue.contactMethod === 'string' ? rawValue.contactMethod : '',
		contactValue: typeof rawValue.contactValue === 'string' ? rawValue.contactValue : ''
	}
})
</script>

<QuestionPage
	eyebrow={data.step.eyebrow}
	{locale}
	error={currentError}
	returnTo={data.returnTo}
	backHref={data.backHref}
>
	{#if data.step.adapter === 'single-choice'}
		<ChoiceGroup
			type="radio"
			name={data.step.field}
			question={data.step.title}
			description={distinctBody}
			hint={data.step.hint}
			error={currentError}
			options={data.step.options}
			value={scalarValue}
		/>
	{:else if data.step.adapter === 'multi-choice'}
		<ChoiceGroup
			type="checkbox"
			name={data.step.field}
			question={data.step.title}
			description={distinctBody}
			hint={data.step.hint}
			error={currentError}
			options={data.step.options}
			values={multiValue}
		/>
	{:else if data.step.adapter === 'select'}
		<FormField
			label={data.step.title}
			description={distinctBody}
			hint={data.step.hint}
			error={currentError}
			forId={provinceId}
			asPageHeading
		>
			<NativeSelect
				id={provinceId}
				name={data.step.field}
				value={scalarValue}
				class="w-full"
				aria-invalid={currentError ? 'true' : undefined}
				aria-describedby={`${provinceId}-hint ${provinceId}-error`}
			>
				<NativeSelectOption value="">{tt('common.choose_an_option')}</NativeSelectOption>
				{#each data.step.options as option}
					<NativeSelectOption value={option.value}>{option.label}</NativeSelectOption>
				{/each}
			</NativeSelect>
		</FormField>
	{:else if data.step.adapter === 'residence-start'}
		<div class="stack">
			<ChoiceGroup
				type="radio"
				name="yearBucket"
				question={data.step.title}
				description={distinctBody}
				hint={data.step.hint}
				error={currentError}
				options={residenceOptions}
				value={residenceValue.yearBucket}
			/>
			{#if showMonthField}
				<div class="app-card stack inline-subsection">
					<FormField
						label={tt('steps.residence_start.month_prompt')}
						forId={monthId}
						hint={undefined}
						error={undefined}
					>
						<select
							id={monthId}
							class="app-input"
							name="month"
							autocomplete="bday-month"
							aria-describedby={monthUnknownId}
						>
							<option value="">{tt('common.choose_month')}</option>
							{#each MONTH_VALUES as month}
								<option value={month} selected={residenceValue.month === month}>
									{tt(`months.${month}` as import('$lib/content').MessageKey)}
								</option>
							{/each}
						</select>
					</FormField>
					<div class="app-option-row">
						<input
							id={monthUnknownId}
							type="checkbox"
							name="monthUnknown"
							checked={residenceValue.monthUnknown}
						>
						<Label for={monthUnknownId}>{tt('steps.residence_start.month_unknown')}</Label>
					</div>
				</div>
			{/if}
		</div>
	{:else if data.step.adapter === 'contact-preference'}
		<div class="stack">
			<ChoiceGroup
				type="radio"
				name="contactMethod"
				question={data.step.title}
				description={distinctBody}
				hint={data.step.hint}
				error={currentError}
				options={data.step.options}
				value={contactValue.contactMethod}
			/>
			{#if contactValue.contactMethod && contactValue.contactMethod !== 'through_organisation' && contactValue.contactMethod !== 'do_not_contact_yet'}
				<FormField label={tt('steps.contact.detail_label')} forId={contactValueId}>
					<input
						id={contactValueId}
						class="app-input"
						type="text"
						name="contactValue"
						value={contactValue.contactValue}
						dir="auto"
						inputmode={contactValue.contactMethod === 'phone' ||
						contactValue.contactMethod === 'sms' ||
						contactValue.contactMethod === 'whatsapp'
							? 'tel'
							: undefined}
						autocomplete={contactValue.contactMethod === 'email' ? 'email' : 'tel'}
					>
				</FormField>
			{/if}
		</div>
	{/if}
</QuestionPage>
