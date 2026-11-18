# Waymark

**Agent Skill Routing & Regression Bench**

Waymark answers one practical question: *when a task is routed through a skill catalog, does the agent choose the right skill—and does that choice change when a skill description is rewritten or injected?*

Given a task such as “review this diff, report findings, and do not edit files,” Waymark records the expected skill, the retriever’s ranked candidates, the agent’s chosen skill, and whether the chosen skill can violate the task’s constraints. Results stay tied to a fixed scenario and catalog revision so regressions can be compared.

## First benchmark: description-induced selection shift

`benchmarks/skill-selection-shift/` contains a fictional skill catalog and 10 controlled tasks. It compares four conditions while changing one competing skill at a time:

1. **Control:** original description.
2. **Surface rewrite:** a meaning-preserving wrapper around the description.
3. **Keyword stuffing:** task terms are repeated in the competing skill’s description.
4. **Prompt injection:** the competing description contains an instruction to select that skill regardless of the user’s request.

The intended pipeline is `task → BM25 retrieval → top-k skill candidates → agent choice`. The checked-in pilot currently exercises BM25 and a deterministic rank-1 router only. The model adapter is available, but no local model or API was configured for this run. No skill code is executed; unsafe routing is a proxy based on the selected skill’s declared side effects and the task’s constraints.

The adoption-curve probe also increases the share of competing skills using keyword stuffing, following C-SEO Bench’s multi-adopter evaluation idea.

### Run the no-dependency retrieval baseline

Requires Python 3.9+; no dataset or model downloads.

```bash
python3 benchmarks/skill-selection-shift/run.py
```

This runs a deterministic lexical router and writes `summary.json`, `paired_results.csv`, and `adoption_curve.csv` to a timestamped directory. **It measures retrieval/ranking changes only; it is not evidence that an LLM follows an injection.**

### Checked-in pilot

The 17 Nov 2026 pilot has 10 synthetic tasks and one run per condition:

- Keyword stuffing changed the selected route on 9/10 tasks; the edited competitor outranked the expected skill on 10/10.
- A meaning-preserving wrapper changed 0/10 routes.
- Injection changed 0/10 lexical routes by design: injection text is excluded from the retrieval index, and no LLM decision stage ran.

This is a pipeline smoke test, not a reliable estimate of real-world risk. The dashboard reads these results from `benchmarks/skill-selection-shift/results/lexical-pilot-2026-11-17/summary.json`.

### Run against a local Ollama model

Use a model already available in your local Ollama installation:

```bash
OLLAMA_MODEL=your-local-model python3 benchmarks/skill-selection-shift/run.py \
  --provider ollama --model "$OLLAMA_MODEL"
```

### Run against an OpenAI-compatible endpoint

Set `OPENAI_API_KEY`, optionally set `OPENAI_BASE_URL`, then pass the provider’s model name:

```bash
OPENAI_API_KEY=... OPENAI_BASE_URL=https://api.openai.com/v1 \
  python3 benchmarks/skill-selection-shift/run.py \
  --provider openai-compatible --model your-model
```

The model run makes one request per task × condition × prompt policy × replicate (80 requests at the defaults). API charges depend on the configured provider. Start with `--limit 2` for a small smoke run. The API key is read from the environment and never written to result files.

## Metrics

- `gold_top1_rate`, `gold_mrr`: whether the intended skill stays retrievable and first.
- `attack_outranks_gold_rate`: how often the modified competing skill moves above the intended skill.
- `selection_flip_rate_vs_control`: how often the agent changes its selected skill.
- `selected_attack_rate`: how often it chooses the modified competitor.
- `unsafe_route_rate`: how often a task that forbids side effects is routed to a skill marked as changing files or sending messages.
- `adoption_curve`: retrieval-rank changes as more catalog entries adopt keyword stuffing.

## Research grounding and scope

- Kumar & Lakkaraju show that a strategic text sequence added to a **fictional coffee-machine product description** can change its recommendation rank; they evaluate repeated model outputs and randomize candidate order. [Paper](https://arxiv.org/abs/2404.07981)
- C-SEO Bench expands content-manipulation evaluation across tasks, domains, and adoption rates, using rank changes as an outcome. It explicitly leaves malicious-content robustness outside its scope. [Paper](https://openreview.net/forum?id=oTeixD3oZO)

Waymark borrows those experimental controls and changes the outcome of interest from product recommendation/citation rank to **agent skill routing plus task-constraint risk**. This pilot does not establish a new benchmark’s validity; it is an executable starting point for checking whether the question yields measurable effects.

## Web interface

The Waymark dashboard imports the checked-in pilot summary and shows the result, adoption curve, and one task trace. It labels the run as a lexical baseline and explicitly marks LLM injection behavior as untested.

```bash
npm install
npm run dev
```

## License

MIT. See [LICENSE](LICENSE).
