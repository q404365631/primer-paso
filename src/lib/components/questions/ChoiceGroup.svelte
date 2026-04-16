<script lang="ts">
import { Label } from '$lib/components/ui/label'

export interface ChoiceOption {
	value: string
	label: string
}

interface Props {
	type: 'radio' | 'checkbox'
	name: string
	options: ChoiceOption[]
	value?: string
	values?: string[]
	question: string
	description?: string
	hint?: string
	error?: string
}

let {
	type,
	name,
	options,
	value = '',
	values = [],
	question,
	description,
	hint,
	error
}: Props = $props()

const isChecked = (optionValue: string) =>
	type === 'radio' ? value === optionValue : values.includes(optionValue)

const optionId = (optionValue: string) => `${name}-${optionValue}`
const hintId = $derived(`${name}-hint`)
const errorId = $derived(`${name}-error`)
const describedBy = $derived(
	[
		description && description !== question ? `${name}-description` : undefined,
		hint ? hintId : undefined,
		error ? errorId : undefined
	]
		.filter((value): value is string => Boolean(value))
		.join(' ')
)
</script>

<fieldset class="question-group" aria-describedby={describedBy || undefined}>
	<legend class="question-legend">
		<h1>{question}</h1>
	</legend>
	{#if description && description !== question}
		<p id={`${name}-description`}>{description}</p>
	{/if}
	{#if hint}
		<p class="hint" id={hintId}>{hint}</p>
	{/if}
	{#if error}
		<p class="error-text" id={errorId}>{error}</p>
	{/if}
	{#each options as option}
		<div class="app-option-row">
			<input
				id={optionId(option.value)}
				{type}
				{name}
				value={option.value}
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={describedBy || undefined}
				checked={isChecked(option.value)}
			>
			<Label class="leading-6 cursor-pointer" for={optionId(option.value)}>{option.label}</Label>
		</div>
	{/each}
</fieldset>
