Review this entire codebase with the following goals:

1. **Security** — auth, injection, secrets exposure, insecure dependencies
2. **Architecture** — separation of concerns, coupling, scalability red flags
3. **Bugs & logic errors** — race conditions, edge cases, null handling
4. **Code quality** — duplication, naming, dead code, complexity
5. **Performance** — N+1 queries, unnecessary re-renders, blocking ops

For each issue found:
- File path + line number
- Severity (critical / high / medium / low)
- What the problem is
- Concrete fix suggestion

Start by mapping the overall structure, then go module by module.
Do NOT make changes — analysis only.