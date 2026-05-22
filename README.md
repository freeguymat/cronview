# cronview

Terminal dashboard for visualizing and testing cron expressions with next-run previews.

## Installation

```bash
npm install -g cronview
```

## Usage

Launch the interactive terminal dashboard:

```bash
cronview
```

Pass a cron expression directly to preview the next scheduled runs:

```bash
cronview "*/5 * * * *"
```

Example output:

```
Expression: */5 * * * *
Description: Every 5 minutes

Next 5 runs:
  1. 2024-03-15 14:25:00
  2. 2024-03-15 14:30:00
  3. 2024-03-15 14:35:00
  4. 2024-03-15 14:40:00
  5. 2024-03-15 14:45:00
```

Use the interactive mode to build, edit, and validate expressions in real time with an intuitive terminal UI.

```bash
cronview --interactive
```

## Features

- Real-time cron expression parsing and validation
- Next-run preview with configurable lookahead count
- Human-readable expression descriptions
- Interactive terminal dashboard powered by blessed
- Supports standard and extended cron syntax

## License

MIT © [cronview contributors](https://github.com/cronview/cronview)