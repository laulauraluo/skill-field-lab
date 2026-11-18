import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownRight, ArrowUpRight, BookOpen, Braces, Database, FlaskConical, Github, ShieldAlert } from 'lucide-react';
import pilot from '../benchmarks/skill-selection-shift/results/lexical-pilot-2026-11-17/summary.json';
import './style.css';

const labels = {
  control: ['Original descriptions', 'Baseline'],
  rewrite: ['Surface rewrite', 'Meaning-preserving wrapper'],
  keyword_stuffing: ['Keyword stuffing', 'Retrieval manipulation'],
  injection: ['Instruction injection', 'Shown after retrieval'],
};
const pct = (n) => `${Math.round(n * 100)}%`;

function App() {
  const rows = Object.entries(pilot.summary);
  const adoption = Object.entries(pilot.adoption_curve);
  const trace = pilot.example_trace ?? [];
  const maxRankGain = Math.max(...adoption.map(([, x]) => Math.max(0, -x.mean_gold_rank_gain)), 1);

  return <div className="app-shell">
    <aside className="rail">
      <a className="brand" href="#top"><span className="brand-mark"><FlaskConical size={17}/></span><span><b>Waymark</b><small>FIELD NOTES ON ROUTING</small></span></a>
      <div className="rail-label">THE QUESTION</div>
      <p className="rail-question">Can a skill’s description change which skill an agent picks?</p>
      <div className="rail-rule"/>
      <a className="rail-link active" href="#findings">01 <span>Findings</span></a>
      <a className="rail-link" href="#adoption">02 <span>Adoption curve</span></a>
      <a className="rail-link" href="#trace">03 <span>One task, step by step</span></a>
      <a className="rail-link" href="#method">04 <span>How it was measured</span></a>
      <div className="rail-bottom"><span className="status-dot"/> Synthetic pilot · local baseline</div>
    </aside>

    <main id="top" className="content">
      <header className="topbar"><span>WAYMARK <i>/</i> SKILL SELECTION SHIFT</span><a href="https://github.com/laulauraluo/skill-field-lab"><Github size={15}/> Source</a></header>
      <section className="hero">
        <div className="kicker">A SMALL, CONTROLLED ROUTING EXPERIMENT <span>·</span> 17 NOV 2026</div>
        <h1>When skill descriptions<br/><em>compete for the route.</em></h1>
        <p className="dek">A fictional skill catalog, fixed tasks, and paired description edits. We measure whether retrieval changes the winner—and keep retrieval effects separate from an agent obeying injected text.</p>
        <div className="scope-note"><ShieldAlert size={15}/><span><b>This run used no language model.</b> It tests BM25 retrieval with a deterministic “pick rank one” router. The injection result says nothing about how an LLM follows malicious instructions.</span></div>
      </section>

      <section id="findings" className="section">
        <div className="section-head"><div><div className="section-no">01 — THE RESULT</div><h2>One edit moved the route.<br/><span>One did not.</span></h2></div><p className="section-aside">10 tasks · 18 fictional skills<br/>BM25, top-k 5 · 1 run per condition</p></div>
        <div className="finding-grid">
          <article className="finding primary-finding"><div className="finding-label"><ArrowDownRight size={15}/> RETRIEVAL CHANGED</div><strong>{pct(pilot.summary.keyword_stuffing.selection_flip_rate_vs_control)}</strong><p>of routes flipped when the competing description repeated the task’s search terms.</p><div className="finding-foot">Modified skill outranked intended skill in {pct(pilot.summary.keyword_stuffing.attack_outranks_gold_rate)} of tasks.</div></article>
          <article className="finding"><div className="finding-label quiet"><ArrowUpRight size={15}/> NO RANKING CHANGE</div><strong>{pct(pilot.summary.rewrite.selection_flip_rate_vs_control)}</strong><p>of routes flipped under a surface rewrite that kept the description’s meaning.</p><div className="finding-foot">This rewrite is a wrapper, not a broad paraphrase test.</div></article>
          <article className="finding caution-finding"><div className="finding-label caution"><ShieldAlert size={14}/> INJECTION: NOT TESTED</div><strong>—</strong><p>The injected text was excluded from the BM25 index. No LLM choice stage ran.</p><div className="finding-foot">An actual model test is still needed for prompt-injection behavior.</div></article>
        </div>

        <div className="panel results-panel">
          <div className="panel-title"><div><div className="section-no">PAIRED CONDITIONS</div><h3>What changed across the 10 tasks</h3></div><span className="unit">share of tasks</span></div>
          <div className="result-table">
            <div className="table-head"><span>Condition</span><span>Gold skill top-1</span><span>Edited skill beats gold</span><span>Route flips</span></div>
            {rows.map(([key, val]) => <div className={`table-row ${key === 'keyword_stuffing' ? 'highlight-row' : ''}`} key={key}>
              <div className="condition-name"><b>{labels[key][0]}</b><small>{labels[key][1]}</small></div>
              <div className="bar-cell"><span>{pct(val.gold_top1_rate)}</span><i><b style={{width:pct(val.gold_top1_rate)}}/></i></div>
              <div className="bar-cell"><span>{pct(val.attack_outranks_gold_rate)}</span><i><b style={{width:pct(val.attack_outranks_gold_rate)}}/></i></div>
              <div className="bar-cell"><span>{key === 'injection' ? '0%*' : pct(val.selection_flip_rate_vs_control)}</span><i><b style={{width:pct(val.selection_flip_rate_vs_control)}}/></i></div>
            </div>)}
          </div>
          <div className="table-note">* Injection text was deliberately kept out of retrieval indexing; lexical selection cannot follow instructions in text. This 0% is a pipeline control, not a safety score.</div>
        </div>
      </section>

      <section id="adoption" className="section adoption-section">
        <div className="section-head"><div><div className="section-no">02 — WHEN OTHERS COPY IT</div><h2>The ranking gets crowded<br/><span>as more descriptions stuff keywords.</span></h2></div><p className="section-aside">Stress test: a growing share of<br/>competing skills adopts the same tactic.</p></div>
        <div className="panel adoption-panel">
          <div className="panel-title"><div><div className="section-no">MULTI-ADOPTER STRESS TEST</div><h3>Mean rank loss for the intended skill</h3></div><span className="unit">rank positions</span></div>
          <div className="adoption-chart">
            {adoption.map(([alpha, values]) => <div className="adoption-col" key={alpha}>
              <div className="adoption-value">{values.mean_gold_rank_gain === 0 ? '0' : values.mean_gold_rank_gain.toFixed(1)}</div>
              <div className="bar-track"><i style={{height:`${Math.max(2, -values.mean_gold_rank_gain / maxRankGain * 100)}%`}}/></div>
              <b>{Math.round(Number(alpha)*100)}%</b><small>adopters</small>
            </div>)}
          </div>
          <div className="chart-caption">Negative rank gain means the intended skill fell in the list. In this synthetic setup, top-1 accuracy was {pct(adoption[0][1].gold_top1_rate)} at 0% adoption and {pct(adoption.at(-1)[1].gold_top1_rate)} at 100%.</div>
        </div>
      </section>

      <section id="trace" className="section">
        <div className="section-head"><div><div className="section-no">03 — OPEN THE NOTEBOOK</div><h2>One task, step by step.</h2></div><p className="section-aside">Same task and candidate skills;<br/>only one description changes.</p></div>
        <div className="trace-card">
          <div className="trace-query"><span className="step-tag">TASK {trace[0]?.task_id ?? 'T01'}</span><p>“{trace[0]?.query ?? 'Review a code change and report risks. Do not modify files or send messages.'}”</p><small>Expected route: <b>{trace[0]?.gold_skill ?? 'review-diff'}</b> · competing description: <b>{trace[0]?.attack_skill ?? 'auto-fix'}</b></small></div>
          <div className="trace-rows">{trace.map(row => <div className="trace-row" key={row.condition}><span className="trace-condition">{labels[row.condition]?.[0] ?? row.condition}</span><span className="rank-pill">gold #{row.gold_rank}</span><span className="rank-pill competitor">competitor #{row.attack_rank}</span><span className={`choice ${row.selected_skill === row.gold_skill ? 'correct' : 'shifted'}`}>picked {row.selected_skill}</span></div>)}</div>
        </div>
      </section>

      <section id="method" className="section method-section">
        <div className="section-head"><div><div className="section-no">04 — WHAT THIS DOES AND DOESN’T SHOW</div><h2>A routing stress test,<br/><span>not an LLM safety result.</span></h2></div></div>
        <div className="method-grid">
          <article><Database size={17}/><h3>Setup</h3><p>{pilot.n_skills} invented skill entries, {pilot.n_tasks} task prompts, a fixed BM25 retriever, and top-5 candidates. Each task has a pre-declared expected skill and one edited competitor.</p></article>
          <article><Braces size={17}/><h3>Isolation</h3><p>Keyword stuffing is indexed, so it can change retrieval rank. Injection text is shown only after retrieval, so a later model test can isolate whether the agent obeys it.</p></article>
          <article><BookOpen size={17}/><h3>Next measurement</h3><p>Run the same paired cases with an Ollama or OpenAI-compatible model, shuffle candidate order, and compare naive vs. guarded prompts. That result is not available in this run.</p></article>
        </div>
        <div className="bottom-line"><b>Interpretation</b><span>In this tiny synthetic catalog, keyword repetition can hijack a lexical retriever. The pilot does not establish real-world prevalence, statistical reliability, or LLM vulnerability.</span></div>
      </section>

      <footer><span>Waymark <i>·</i> Measure the route before trusting the choice.</span><a href="https://github.com/laulauraluo/skill-field-lab"><Github size={14}/> Repository</a></footer>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
