<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:cactus-product-context-rules -->
# Cactus product context discipline

Before changing Cactus product UX, app structure, Vault/Spaces behavior, data architecture, workflows, outputs, or agent/automation concepts, read:

- `docs/product/cactus-context-index.md`
- `.hermes/plans/2026-05-10_130903-cactus-whole-app-blueprint.md`
- `.hermes/plans/cactus-product-operating-model.md`
- `.hermes/plans/cactus-data-sources-vault-strategy.md`
- `.hermes/plans/cactus-vault-time-series-cost-strategy.md`

When Tyler gives durable product/design/infrastructure guidance, update the relevant `.md` context file before or alongside code changes. Do not leave important product decisions only in chat.

Avoid duplicating large sections across docs. Prefer updating the canonical file and linking from `docs/product/cactus-context-index.md` so the product context stays coherent rather than becoming a Frankenstein set of overlapping notes.
<!-- END:cactus-product-context-rules -->
