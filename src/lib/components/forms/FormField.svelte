<script lang="ts">
import { Label } from '$lib/components/ui/label'

interface Props {
	label?: string
	description?: string
	hint?: string
	error?: string
	forId?: string
	asPageHeading?: boolean
	children?: import('svelte').Snippet
}

let { label, description, hint, error, forId, asPageHeading = false, children }: Props = $props()

const hintId = $derived(forId ? `${forId}-hint` : undefined)
const errorId = $derived(forId ? `${forId}-error` : undefined)
</script>

<div class="form-field">
	{#if label}
		{#if asPageHeading}
			<Label for={forId}> <h1>{label}</h1> </Label>
		{:else}
			<Label for={forId}>{label}</Label>
		{/if}
	{/if}
	{#if description && description !== label}
		<p>{description}</p>
	{/if}
	{#if hint}
		<p class="hint" id={hintId}>{hint}</p>
	{/if}
	{@render children?.()}
	{#if error}
		<p class="error-text" id={errorId}>{error}</p>
	{/if}
</div>
