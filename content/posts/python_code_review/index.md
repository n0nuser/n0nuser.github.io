---
slug: "python-code-review-guide"
title: "An Opinionated Python Code Review Guide"
description: "The checklist I use to review Python code: architecture, typing, imports, state, naming, validation, errors, comments, tests, concurrency and resource lifecycle, with the reasoning behind each rule."
date: 2026-09-26
lastmod: 2026-09-26
author: "Pablo Jesús González Rubio"
coverAlt: "An Opinionated Python Code Review Guide"
toc: true
draft: false
tags: [ "Software Development", "Python" ]
---

This is the checklist I review Python code against. Each section is a group of rules, each rule is one line, and code shows up only where a rule needs it. Where a rule is one a reasonable engineer would push back on, the counterpoint is stated and answered.

It's written for two readers: someone joining a team who wants to know what review will look like, and someone reviewing a lot of PRs who wants a list to work from. It assumes the fundamentals (clean code, SOLID, testing, code smells); if you want a refresher first, see [Software Development Best Practices](/posts/software-development-best-practices/).

> Examples target **Python 3.11+**. Tools: [Ruff](https://docs.astral.sh/ruff/), [mypy](https://mypy.readthedocs.io/), [pyright](https://microsoft.github.io/pyright/), [Pydantic](https://docs.pydantic.dev/), [pytest](https://docs.pytest.org/).

## How I review: a ledger, not memory

Before any rule, check intent:

- Does the code do what the ticket asks, and only that?
- Is a business rule missing that only someone who knows the domain would know?
- Is the solution as complex as the problem, and no more?

Then the rules:

- Copy the checklist next to the PR. Don't rebuild it from memory.
- Give every rule a verdict: `PASS`, `FAIL` or `N/A`, with a `file:line` as evidence.
- `N/A` is a decision (no code of that kind in the diff, or a green linter already covers it). A blank row means the rule was never considered.
- Write review comments **only** from the `FAIL` rows.

```text
| Rule                                  | Verdict | Evidence               |
|---------------------------------------|---------|------------------------|
| No `except Exception`                 | N/A     | ruff gate green        |
| No check-then-act across an `await`   | FAIL    | accounts/service.py:42 |
| Timeouts on every external call       | PASS    | clients/http.py:18     |
```

> **Counterpoint:** "A checklist turns review into box-ticking, and CI is green anyway."
>
> A green pipeline tells you the tools are happy. Most rules below aren't checked by any tool. I've seen a branch with green tests, Ruff, mypy and pyright come back from this checklist with six `FAIL` rows, one of them a docstring that said the opposite of what the code did. The checklist doesn't replace judgment. It makes sure judgment is applied to every area, not only the first one that caught your eye.

## What the tools own

Anything a tool can decide isn't a review comment. Formatting, import order, `Optional` vs `X | None`, bare `except` and relative imports all belong to the linter:

```toml
[tool.ruff.lint]
# I: import order, UP: modern syntax (X | None, builtin generics),
# BLE: blind `except Exception`, TID: relative imports, D: docstring format
select = ["E", "F", "I", "B", "UP", "SIM", "BLE", "TID", "D"]
ignore = ["D100", "D101", "D102", "D103", "D104", "D105", "D106", "D107"]

[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.ruff.lint.flake8-tidy-imports]
ban-relative-imports = "all"
```

- If the gate is green and covers a rule, that row is `N/A`.
- If the gate is missing, the one review comment is "add the gate".
- `D1xx` stays ignored: the gate checks docstring *format*, never forces their *presence*.

## Architecture and module structure

- **Three layers, named after what they do:** `controller/` (every exposed surface: HTTP endpoints, CLI, tools), `service/` (logic, grouped by capability), `repository/` (every outbound boundary: DB, object stores, HTTP peers).
- **Dependencies point inward.** A service never touches transport types. A controller never skips the service to reach the repository.
- **The entry module stays thin:** bootstrap, wiring and lifespan only.
- **No `helpers.py` or `utils.py`.** A helper lives in the module that owns the concept, or in its own module named after it.
- **Large literals** (a system prompt, a big mapping) go in their own module.
- **One cohesive unit per module.** Split an oversized package into subpackages. `__init__.py` is empty, except at a library's public boundary.
- **A folder with a single module** gets inlined into its parent.
- **I/O stays at the edges.** Importing a package touches nothing: no network, no file reads, no environment lookups.
- **YAGNI:** no abstraction until the logic is reused, non-trivial, or clutters the main flow. Trivial single-use logic stays inline.
- **No pass-through wrappers.** A method that only forwards to a collaborator's method of the same name gets deleted. Wrappers that validate, adapt or narrow are fine.
- **Behaviour lives with the state it owns.** Invariants and calculations over one object go on that object. Logic moves to a service only when it spans objects or needs an injected collaborator.

```python
# ❌ Anemic model: the service computes what the order already knows
def order_total(order: Order) -> Decimal:
    return sum((line.price * line.quantity for line in order.lines), Decimal(0))

# ✅ The order owns its own total
@dataclass(frozen=True)
class Order:
    lines: tuple[LineItem, ...]

    @property
    def total(self) -> Decimal:
        return sum((line.price * line.quantity for line in self.lines), Decimal(0))
```

## Configuration and typing

- **Env config through `pydantic-settings`**, not `os.environ.get`. Import `BaseSettings` from `pydantic_settings`, not from `pydantic`.
- **Config values live in the settings module**, not scattered through business code.
- **No `cast()`.** It's a promise to the type checker that nothing checks at runtime. Parse the boundary with a typed model instead.
- **A known, fixed key set gets a type** (model, dataclass or `TypedDict`). `dict[str, X]` is only for genuinely open keys.
- **No stringly-typed returns.** A result the caller has to compare against strings is an enum.
- `X | None`, never `Optional` / `Union`; builtin `list` / `dict` / `tuple`, never `typing.List`.
- **`Field()` only when it adds something:** a constraint, an alias, or API docs. Plain defaults are set directly.
- **Strict typing:** `mypy --strict` (and pyright) gate new code.

```python
# ❌
def check(order: Order) -> str:
    return "missing_items" if not order.lines else "ok"

# ✅
class OrderCheck(StrEnum):
    OK = "ok"
    MISSING_ITEMS = "missing_items"

def check(order: Order) -> OrderCheck:
    return OrderCheck.MISSING_ITEMS if not order.lines else OrderCheck.OK
```

```python
class Settings(BaseSettings):
    database_url: str
    request_timeout_s: float = 5.0  # plain default, no Field()
    max_batch_size: int = Field(default=500, gt=0, le=2_000)  # constraint: Field earns it
```

## Imports

- All imports at the top of the module. Never inside a function or a conditional.
- Absolute imports only.
- Never import a `_`-prefixed name from another module. Make it public, move it, or inline it.
- `__all__` only in a re-export `__init__.py`, never in a regular module.

## State and `__init__`

- **No module-level mutable state**, and no singleton used to dodge dependency injection. A frozen, load-once constant such as `Settings` is the exception.
- **No logic in `__init__`.** Assignments only. I/O, parsing and heavy computation go in a `@classmethod` factory.
- **Inject boundary collaborators** (DB, HTTP, cloud clients) through the constructor.

```python
# ❌ Constructing the object does I/O: hard to test, hard to reason about
class PriceList:
    def __init__(self, path: Path) -> None:
        self._prices = json.loads(path.read_text())

# ✅ __init__ assigns; the factory does the work
class PriceList:
    def __init__(self, prices: dict[str, Decimal]) -> None:
        self._prices = prices

    @classmethod
    def from_file(cls, path: Path) -> "PriceList":
        raw = json.loads(path.read_text())
        return cls({sku: Decimal(price) for sku, price in raw.items()})
```

> **Counterpoint:** "A factory for every class is ceremony. `__init__` doing a bit of setup is normal Python."
>
> For a value object with no I/O, yes: there's no factory to write. The rule targets `__init__` methods that read files, call APIs or parse input. Those make every instantiation a side effect, including in tests, where you then need a real file or a patch just to build the object. With a factory, the constructor takes plain data and the test builds it in one line.

## Naming and classes

- **I don't play with names. Semantics and consistency are what matter**, so everyone reads the code the same way. One concept, one name across the codebase (not `customer`, `client` and `account` for the same thing), and a name never says something the code doesn't do.
- **The domain glossary wins.** If the project has one (`CONTEXT.md`), names use its terms, not synonyms.
- **Name intermediate conditions.** Break a dense `if` into named booleans.
- **A `bool` argument at a call site is usually an enum waiting to happen.**
- **The code explains itself.** If a reviewer needs a comment to understand intent, rename first.
- **No terms borrowed from another trade.** `profile` means performance profiling, so a function that inspects column types is `discover_structure`, not `profile_data`.
- **English everywhere:** identifiers, comments, logs, user-facing messages. Domain proper nouns are the exception.
- **No codenames, ticket numbers or sprint labels in code.** Traceability lives in the commit message and the PR.
- **A class earns its instance:** real state, an injected collaborator, or a substitutable abstraction. No all-`@staticmethod` utility classes.
- **A `Protocol` needs two or more real implementations swapped at runtime.** A test-only seam lives in the test suite.
- **Field names over indexes**, and no `getattr` / `setattr` when the attribute name is known.
- **No anonymous tuples** where positions mean different things. Return a small frozen dataclass.
- **List-returning functions return `[]`**, not `None`, unless "absent" really differs from "empty".
- **No magic strings or numbers:** a `StrEnum` or a constant (`HTTPStatus.NOT_FOUND`, not `404`).

```python
# ❌ What's first? What's second?
def parse_error(exc: HTTPException) -> tuple[str, str]: ...
code, message = parse_error(exc)

# ✅
@dataclass(frozen=True)
class ParsedError:
    code: str
    message: str

    @classmethod
    def from_http_exception(cls, exc: HTTPException) -> "ParsedError": ...
```

## Validation

- **Pydantic models and validators, not hand-rolled checks.** The model *is* the validation.
- **Validate at the boundary, once.** The same check copied into three layers drifts until nobody knows which one is authoritative.
- **Fields are `snake_case` in Python.** If the JSON must be camelCase, use `alias_generator=to_camel` and `model_dump(by_alias=True)`.

```python
# ❌
def create_order(body: dict[str, Any]) -> Order:
    if not body.get("items"):
        raise ValueError("items required")
    if body.get("currency") not in {"EUR", "USD"}:
        raise ValueError("bad currency")
    ...

# ✅
class CreateOrderRequest(BaseModel):
    items: list[LineItemIn] = Field(min_length=1)
    currency: Currency  # a StrEnum: unknown values fail at parse time
```

## Error handling

- **Specific exceptions only. Never `except Exception`.** In route handlers, let errors reach the error-handling middleware.
- **Propagate, don't swallow.** Translate with `raise DomainError(...) from err`, so the original traceback survives.
- **A base exception per package**, with the specific ones in a dedicated errors module, not declared inline at the `raise`.
- **Retry only transient failures, on idempotent operations, with a limit.** Retrying a non-idempotent `POST` duplicates the side effect.
- **Error responses don't leak internals:** no stack traces, SQL or file paths in what the client sees.
- **Log the branches that matter, with a request ID,** so one request can be followed across services.

```python
# billing/errors.py
class BillingError(Exception): ...
class PaymentDeclined(BillingError): ...

# billing/service.py
def charge(order: Order) -> Receipt:
    try:
        return gateway.charge(order.total, order.card_token)
    except gateway.CardDeclinedError as err:
        raise PaymentDeclined(order.id) from err
```

> **Counterpoint:** "`except Exception` at the top of a worker loop keeps one bad message from killing the process."
>
> That's the one legitimate place, and it isn't business code: it's the process boundary, the same role the web framework's middleware plays for routes. Put it there once, log with the traceback, and keep every other `except` specific. Inside business code, `except Exception` treats a typo'd attribute the same way as a network blip.

## Security

- **Every input is validated** before it reaches logic: request bodies, paths, file uploads, headers.
- **New attack surface is named in the PR:** a new endpoint, a new upload path, a new outbound call.
- **Secrets come from settings or a secret manager.** Never in code, logs or error messages.

## Docstrings and comments

- **Comments explain *why*:** a decision, a constraint, a trade-off. Never *what* the next line does.
- **A non-obvious business decision gets an inline note.** A temporary one gets a `TODO` with its removal condition.
- **Comments survive loss of context:** no "see the PR", no ticket numbers, no "currently", "not yet" or "as of this writing". Citing an ADR as the design record is fine.
- **No forced docstrings.** Write one only when it adds what the signature can't say, in Google style, with no Sphinx roles.
- **No section-banner comments.** A banner usually means the module does too much.
- **Check every stated reason against the artifact it claims.** A false rationale is worse than none.
- **Empty `__init__.py` means empty:** no comment, no docstring.

```python
# ❌ Narrates the code, or depends on context that will disappear
counter += 1  # increment the counter
retry = False  # see the PR, currently disabled

# ✅ Says why, and when to remove it
# Business decision: activation and entitlement update in one transaction,
# so a user never has access without an active subscription.
# TODO: remove when the billing service emits entitlement events itself.
```

## Testing

- **`@pytest.mark.parametrize` for variations.** Never `test_retry_502`, `test_retry_503`.
- **No `test_init_*` and no test files for plain models.** Models are covered by the behaviour that uses them. If `__init__` needs a test, it has logic it shouldn't have.
- **Assert whole objects**, not field by field, unless one field is the behaviour under test.
- **Mock at the boundary only** (HTTP, DB, cloud, I/O). Internal objects are real. Prefer a stub when the behaviour is simple.
- **A fake has the real signature** and rejects what the real client rejects. `def get(self, **_)` accepts arguments the real backend errors on.
- **No `# Arrange / # Act / # Assert` comments.** Blank lines separate the sections.
- **Deterministic:** frozen time for dates, no outbound network.
- **Layout mirrors the source:** `app/service/billing.py` → `tests/service/test_billing.py`.
- **Fixtures:** shared ones in `tests/fixtures/`, a fixture used once stays local, scope as narrow as possible.
- **A bug gets a failing regression test first**, then the fix.
- **A computed parameter list asserts it isn't empty.** pytest reports an empty parametrization as a skip, not a failure.

```python
@pytest.mark.parametrize(
    ("status", "should_retry"),
    [(502, True), (503, True), (504, True), (400, False)],
)
def test_retries_only_gateway_errors(status: int, should_retry: bool) -> None:
    response = httpx.Response(status)

    assert is_retryable(response) is should_retry
```

```python
# ❌ Proves the code calls something, not what it sends
send.assert_called_once()

# ✅ Assert the outcome, as a whole object
assert outbox.sent == [Email(to="ana@example.com", template="welcome")]
```

## Concurrency and race conditions

- **Any change touching shared state** (a row, a cache, a counter, a queue, a file) is reasoned about for races. Name every other reader and writer of that state.
- **No check-then-act split across an `await`.** Another request can run at every `await`.
- **Prefer atomic operations, transactions, idempotency keys or optimistic concurrency** over read-modify-write. A Python lock only covers one process.

```python
# ❌ Two concurrent withdrawals both read 100, both pass, balance ends at -50
balance = await repo.get_balance(account_id)
if balance >= amount:
    await repo.set_balance(account_id, balance - amount)

# ✅ Check and write are one statement where the state lives:
#   UPDATE accounts SET balance = balance - :amount
#   WHERE id = :id AND balance >= :amount
if not await repo.debit_if_sufficient(account_id, amount):
    raise InsufficientFunds(account_id)
```

## Resource lifecycle

- **Caches keyed by request, session or user are bounded** (LRU or TTL) and evicted when the session ends. That includes dicts held on injected objects, not only module globals.
- **Pooled clients** (`httpx`, DB pools) are built once at startup and reused. A short-lived client is scoped with `with` / `async with`.
- **Stream, don't materialise,** when data can be handled incrementally.
- **Every external call has a timeout on both legs,** connect and read. `read=None` is not a timeout.
- **Background tasks holding large payloads are bounded** by a semaphore or a total-bytes cap.

```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=2.0)) as client:
        app.state.http = client  # one pool for the app's lifetime
        yield
```

## Change discipline

These apply to the PR as a whole, not to single lines:

- **Verify before you claim.** "Tests should pass" isn't a result. The PR shows the command and the decisive output line.
- **Never silence a diagnostic.** No bare `# noqa` or `# type: ignore`, no widening the ignore list, no skipped tests to get green. A justified suppression names one code and its reason on the same line.
- **Delete workarounds with their cause.** When the root cause is fixed, the shim, its `# type: ignore` and its doc line go too.
- **No paths relative to the working directory.** `Path(__file__).parent / "fixtures"`, not `Path("tests/fixtures")`.
- **Stay in scope.** Unrelated fixes get mentioned, not slipped in.
- **Chesterton's fence.** If you can't explain why code exists, you can't delete it yet.
- **No optimisation without a measurement.** A "faster" change comes with a before/after number or a profile. Look for N+1 queries and network calls before CPU.

```python
import numpy_stubs  # type: ignore[import-untyped]  # no stubs published upstream  ✅
total = compute(order)  # type: ignore  ❌
```

## Writing the review

- **Critical `FAIL` rows block the merge. Standard ones are should-fix or discuss.** Label each comment so the author knows which is which.
- **One comment per finding,** with the rule, the `file:line` and the fix.
- **Ask when unsure** ("what happens if this list is empty?"), and state it plainly when you're not.
- **Two rounds on the same thread, then a call.** Write the outcome back on the PR.
- **Design problems first.** Don't leave 40 line comments on code that's about to be rewritten.

```text
blocking: accounts/service.py:42 reads the balance, awaits, then
writes it. Two concurrent withdrawals can both pass the check. Move the
check into the UPDATE's WHERE clause.

should-fix: check() returns "ok" / "missing_items" as bare strings.
Return an OrderCheck StrEnum.
```

## The critical rules

The bookmark version: these block a merge on their own.

| Area | Rule |
|---|---|
| Typing | No `cast()`; `X \| None`, never `Optional` / `Union` |
| Imports | Top of module only; absolute only |
| State | No module-level mutable state; no logic in `__init__` |
| Naming | Code explains itself; one name per concept |
| Errors | No `except Exception` in business code |
| Comments | `__init__.py` empty or a pure re-export; no ticket ids or "currently" in comments |
| Tests | `parametrize` for variations; no `__init__` or model tests |
| Concurrency | Shared state reasoned about; no check-then-act across `await`; atomic operations over read-modify-write |
| Resources | Per-session caches bounded; pooled clients built once |

For more general practices around review, see my [software development best practices](/posts/software-development-best-practices/) post.
