# Project Rules

- **Always run lint before finishing any task.** Use `node --stack-size=65536 node_modules/typescript/bin/tsc --noEmit` to avoid the default call-stack overflow on this large codebase. Fix all `error TS` errors before committing.
