# Sprint 3 — Memory Modes & Response Patterns

Sprint 3 focuses on making Velantrim's memory behavior controllable by the user.

The goal is not to force every answer through the heaviest memory path. The goal is to let the user choose when memory should be fast, grounded, or strict.

## What this adds

This PR introduces a versioned contract in:

```text
data/sprint3_memory_response_contract_v1.json
```

It defines:

- memory lookup toggle;
- Normal / Grounded / Strict memory modes;
- unified ESM statuses;
- reusable response patterns such as "Напиши другую версию" and "Помоги мне это обдумать";
- stable localStorage keys for future UI wiring.

## Memory lookup toggle

Storage key:

```text
eiti_memory_lookup_enabled
```

When enabled, the app may check memory before answering.

When disabled, normal chat responses should be faster because the app should not do mandatory memory lookup before every reply. Explicit user requests such as "проверь в памяти" or manual memory search should still be allowed.

## Memory modes

| Mode | Policy | Intended behavior |
|---|---|---|
| `normal` | `opportunistic` | Fast default. Memory is used when cheap/relevant, not as a mandatory gate. |
| `grounded` | `required_when_memory_relevant` | Balanced. Use source facts when the answer depends on remembered user/project facts. |
| `strict` | `required` | Maximum rigor. Only validated or immutable core facts can support confident claims. |

## ESM statuses

Sprint 3 standardizes these statuses:

```text
observed
hypothesis
supported
validated
contradicted
deprecated
immutable_core
```

This prevents memory drift where different parts of the app use different words for the same epistemic state.

## Response patterns

Response patterns are reusable answer intents. They should eventually be exposed in Settings or near the message controls.

Initial patterns:

| Pattern | User-facing meaning |
|---|---|
| `default` | Обычный ответ |
| `rewrite_variant` | Напиши другую версию |
| `think_with_me` | Помоги мне это обдумать |
| `short_answer` | Коротко |
| `deep_dive` | Глубокий разбор |
| `critic` | Критик |
| `action_plan` | План действий |

## Why this matters

Without this control, the app may feel slower because it checks the memory database even when the user only needs a quick conversational answer.

With this contract, the intended behavior becomes explicit:

- `normal` for speed;
- `grounded` for balanced memory use;
- `strict` for verified answers;
- response patterns for changing the style or cognitive mode of the next answer.

## Next implementation step

Wire the contract into `index.html`:

1. Add Settings controls:
   - toggle: "Проверять память перед ответом";
   - select: `Normal / Grounded / Strict`;
   - select/buttons: response patterns.
2. Persist choices in localStorage using the keys from the contract.
3. Make the chat pipeline read these keys before memory retrieval and prompt construction.
4. In strict mode, show source facts / confidence / trace by default.

The current PR intentionally keeps this as a safe contract + test layer so the behavior is pinned before editing the large single-file app.
