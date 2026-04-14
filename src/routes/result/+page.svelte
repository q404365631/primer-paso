<script lang="ts">
let { data } = $props()
</script>

<section class="stack">
	<p class="eyebrow">Result</p>

	<div class="card stack">
		<span class="result-pill">{data.result.title}</span>
		<h1>Your first triage result</h1>
		<p>{data.result.explanation}</p>

		<div class="stack">
			<h2>Suggested next steps</h2>
			<ul>
				{#each data.result.nextSteps as step}
					<li>{step}</li>
				{/each}
			</ul>
		</div>

		{#if data.result.flags.length > 0}
			<div class="stack">
				<h2>Flags raised</h2>
				<ul>
					{#each data.result.flags as flag}
						<li>{flag}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<p class="hint">Summary reference: {data.sessionId}</p>

		<div class="actions">
			<a class="button" href="/start?new=1">Start again</a
			><a class="button secondary" href="/check-answers">Back to answers</a>
		</div>
	</div>
</section>
