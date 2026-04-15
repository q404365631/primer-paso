<script lang="ts">
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
	legend: string
}

let { type, name, options, value = '', values = [], legend }: Props = $props()

const isChecked = (optionValue: string) =>
	type === 'radio' ? value === optionValue : values.includes(optionValue)
</script>

<fieldset class="question-group">
	<legend>{legend}</legend>
	{#each options as option}
		<label class="option">
			<input {type} {name} value={option.value} checked={isChecked(option.value)}>
			<span>{option.label}</span>
		</label>
	{/each}
</fieldset>
