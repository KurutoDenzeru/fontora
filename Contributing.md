# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

## Development

1. Fork this repository.

You can fork this repo by clicking the fork button in the top right corner of this page.

2. Clone the repository.

```bash
git clone https://github.com/KurutoDenzeru/fontora.git
```

3. Install dependencies using Bun.

```bash
bun install
```

4. Start the development server.

```bash
bun run dev
```

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`type(scope): message` in your commit message while using one of
the following categories:

- `feat`: all changes that introduce completely new code or new features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README)
- `style`: changes that do not affect the meaning of the code (formatting,
  UI polish)
- `perf`: changes that improve performance
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration
  (i.e. GitHub Actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(catalog): add filter by variable axis`

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Pull Requests

- Keep one module or concern per commit — never combine unrelated changes.
- Run `bun run build` before requesting review; the build must pass with no errors.
- Small, reviewable diffs win over sweeping rewrites.
