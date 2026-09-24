# Маршрутизатор моделей для tms-pipeline

> Актуально на 12 июля 2026 года. Русская версия каноническая; английская —
> [06-model-routing.md](06-model-routing.md).

Эта памятка отвечает на практический вопрос: какую модель и какое усилие рассуждения ставить на каждой
стадии, чтобы не покупать максимальную мощность там, где достаточно дешёвой проверки, и не экономить на
решениях с большим радиусом ошибки.

OpenAI описывает текущую линейку так: **GPT-5.6 Sol** — флагман для сложного reasoning и coding,
**GPT-5.6 Terra** — баланс качества и стоимости, **GPT-5.6 Luna** — модель для чувствительных к стоимости
массовых задач. Источник: [официальный каталог моделей OpenAI](https://developers.openai.com/api/docs/models).

Названия и доступность моделей могут отличаться между Codex-хостами и аккаунтами. Если runtime не
подтверждает выбранную роль или модель, скилл не должен делать вид, что выбор применён: записывайте
`actual model = runtime-selected/unknown`.

## Рекомендуемый маршрут Codex

| Стадия / работа | По умолчанию | Когда усиливать | Зачем |
|---|---|---|---|
| 00 Ticket | Luna medium | Terra medium, если scope реально спорный | Индексация и классификация ограничены и обычно не требуют дорогого judgement. |
| 01 Research — lead | Terra high | Sol high/xhigh для auth, tenant scope, платежей, PII, миграций, очередей и lifecycle | Lead решает, какие факты несущие; это дороже простого поиска. |
| 01 Research — explorers | Terra medium | Terra high для большой cross-module карты | Сборщики возвращают только `path:line` evidence и не принимают продуктовых решений. |
| 02 Design | Sol high | Sol xhigh для R/C; Max только для одного неразрешённого Profile-C решения после сильного обычного прохода | Ошибка здесь размножается во все следующие стадии. |
| 02b Gap audit | Sol high | Sol xhigh для security/privacy/money/tenant/migration/lifecycle рисков | Нужен независимый риск-judgement, а не дешёвая проверка списка. |
| 03 Delivery plan | Terra high | Luna medium для очевидного M; Sol high при оставшейся R/C-неопределённости | План — структурная декомпозиция утверждённого дизайна; риск всё ещё нельзя занижать. |
| 04 Implementation M/E | Terra high для lead; Luna/Terra для bounded helpers | Sol high только если реализация вскрыла критичный X-ID | Bounded-работа остаётся дешёвой без потери targeted evidence. |
| 04 Implementation R | Terra high Developer/Architect; Luna Validator; Sol high wave Reviewer/Security по trigger | Sol xhigh для сложного money/security решения | Реальное разделение ролей ловит дефект, пока волна ещё локальна. |
| 04 Implementation C | Terra high Developer по умолчанию; Luna Validator; Sol high/xhigh Architect/Security/wave Reviewer | Sol high Developer только для сложной C coding-ветки | Strongest judgement тратится на proving-роли, а не routine code/log collection. |
| 04b Review M/E | Terra high, свежий reviewer | Новый Terra high после любой правки | Независимость контекста важнее одной сверхдорогой модели. |
| 04b Review R/C | Sol xhigh risk reviewer + Terra/Sol high integration reviewer на одном fingerprint; свежий Sol high/xhigh финальный | Max только при реальном неразрешённом споре; не сообщать attempt budget и порог PASS | Ортогональный первый проход объединяется в один batch перед финальным подтверждением. |
| 05 Test report | Luna medium | Terra high для непонятных падений; Sol high для R/C-диагностики | Известные команды и компактный pass/fail дешевы; root-cause judgement — нет. |
| 06 Review gate | Terra high для обычного `go` | Sol high/xhigh для `conditional_go`, `no-go`, R/C, неполной валидации или ручных гейтов | Финальный вердикт нельзя отдавать дешёвому суммаризатору. |
| Полный codebase audit | Terra для карт зон; Terra/Sol для finder/skeptic по риску | Ultra — только для осознанной не-scoring синтеза действительно независимых зон | Один огромный контекст хуже нескольких независимых зон с проверяемыми находками. |

## Маршрут ролей Claude Code

Claude aliases — tool-native defaults, а не утверждение, что они напрямую равны Sol/Terra/Luna:

| Stage-04 роль / профиль | Default | Усиление и evidence |
|---|---|---|
| M | Lead реализует inline | Coding subagent не нужен; записать модель lead, если runtime её показывает |
| E | Lead inline; один bounded Architect/evidence pass + Tester | Architect/Tester `sonnet`; judgement при необходимости усиливать per invocation |
| R | Developer/Tester/Architect/Reviewer `sonnet`; нужный Security `opus` | Записать preferred, configured и actual model; неизвестное остаётся `runtime-selected/unknown` |
| C | Полный набор ролей | Architect/Reviewer override на strongest available; Security оставить на `opus` |

Agent-файлы также задают tool allowlists и permission declarations. Claude Code может переопределить модель
через environment или per-invocation selection; документированный приоритет модели: environment →
invocation → agent frontmatter → main conversation. `permissionMode` применяется у скопированных
project/user agents, но игнорируется у plugin-shipped agents, поэтому plugin-run должен записывать
parent/runtime permission evidence. Нельзя утверждать, что настройка применена, только потому что значение
записано во frontmatter. Источник: [официальная документация Claude Code о subagents](https://code.claude.com/docs/en/sub-agents).

## Жёсткие ограничения

- **Fast mode не использовать** ни на одной стадии пайплайна.
- **Ultra не использовать для scoring-review.** Дорогой контекст не заменяет независимость reviewer-а.
- **Max не является нормальным default.** Это точечная эскалация одного сложного решения, а не режим
  «сделать надёжнее вообще всё».
- После любой правки кода, тестов, SQL, контрактов или конфигурации прежнее принятие 04b аннулируется:
  нужны повторная валидация и новый свежий reviewer той же финальной версии.
- Дешёвый evidence-агент не принимает решения о продукте, архитектуре, безопасности, приватности,
  платежах или финальном статусе стадии.

## Если GPT-5.6 недоступны

Текущие fallback-правила скиллов:

- Luna → `gpt-5.4-mini`;
- Terra → `gpt-5.4`;
- Sol → `gpt-5.5`.

Это fallback tms-pipeline, а не утверждение об одинаковом качестве моделей. При следующем обновлении
линейки сначала сверяйте [официальный каталог](https://developers.openai.com/api/docs/models), затем
меняйте модельные строки в Codex skills и `codex-agents/*.toml`, а эту памятку — последней.

## Что важнее названия модели

1. Чистый вход стадии из предыдущего артефакта.
2. Отдельный свежий контекст для design audit и scoring-review.
3. Точный task-owned diff и fingerprint.
4. Сильная модель только там, где агент принимает решение с большим радиусом ошибки.
5. Честный non-PASS, если доказательство не совпадает с финальной версией реализации.
