# <TASK-ID> — 01 Research

Date: <YYYY-MM-DD>
Base SHA: <sha>

## Goal of this stage

One sentence: which behaviour we trace.

## Vertical

An unbroken chain from the person's action to the database and back. This is
not a list of layers: every row names what exactly it hands to the next one —
a parameter, a field, a flag. An empty or broken "Hands on" cell is a finding,
not an unfinished table: where nobody hands anything on is where the defects
live that no single file shows.

| Layer | File:line | What it does now | Hands on |
|---|---|---|---|

## Neighbours

Sibling routes, contracts, readers and writers of the same data, permissions,
loading and error states, tests.

## Exact places

The full list of files and lines the task may touch. No assessment.

## Precedents in the code

Where this same problem is already solved and how exactly. File:line.

## Data and schema state

Tables, keys, constraints and migrations that matter here.

## Enumerable sets

For every countable subject — the source of the list, the count, and a table
with one row per item. An empty cell is allowed and visible; a missing row is
not.

## Absent — checked

What was opened and really does not contain the thing. With the exact place.

## Not found by search

Which pattern did not match and where it was searched. **This is not a fact of
absence** — the next stage may not build a decision on it.

## Open questions for design

Factual gaps design must close.
