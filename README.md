# Skill Field Lab

A local-first field notebook for testing agent skills against repeatable scenarios.

**What makes it different:** the unit of review is not a single benchmark score. Each run keeps the scenario, skill revision, agent/model, assertion-level evidence, and regression history together so you can inspect *why* a behavior passed or failed.

> **Prototype status:** the current interface is an interactive UI prototype. All displayed runs, scores, model names, and traces are fictional sample data. The “Queue demo run” button only adds a local preview row; it does not call an agent or execute a skill.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production bundle:

```bash
npm run build
npm run preview
```

## Product direction

- Replay a fixed scenario set after each skill edit.
- Store assertion-level evidence beside every score.
- Compare skill revisions and agent/model combinations.
- Keep traces local by default; add explicit export later.
- Distinguish measured results from sample or illustrative data.

The initial design is an independent implementation inspired by the broader idea of interactive, agent-oriented developer tools. It does not reuse Anatomy’s source code or visual assets.

## License

MIT. See [LICENSE](LICENSE).
