---
name: Workspace build quirks
description: Environment-specific setup notes discovered while building typed API and artifact packages.
---

The workspace package installer targets the repository root by default; package changes for a specific workspace package need an explicit pnpm filter. Generated browser clients that use `Headers.entries()` require `dom.iterable` in the client library TypeScript lib list.

**Why:** The first dependency install and first API codegen check both failed for environment-specific reasons rather than application logic.

**How to apply:** When adding backend dependencies, target the owning workspace package. When generated client code reports missing `Headers` iterator members, update that package's TypeScript `lib` settings before changing generated output.