# Personal Mission Control

A local-first personal productivity workspace built with React, TypeScript, Vite, IndexedDB, date-fns, Lucide, and Recharts. No account or backend is required. Your workspace stays in this browser on this device.

## Develop

Use Node.js 24 and npm 11.

```sh
npm ci
npm run dev
```

In restricted cloud machines, use `npm ci --cache /tmp/mission-control-npm-cache` if the home cache is unavailable.

```sh
npm test
npm run build
npm run preview
# With the dev server running and Chromium installed:
npm run test:browser
```

Browser tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` to override and `APP_URL` to test another served build.

The first launch offers a coherent demo workspace, a first goal, or an empty start. Use Quick capture or Q to add a task. Ctrl/Cmd K searches entities and navigation commands. N creates a task; F, G, P, and T open Focus, Goals, Projects, and Today. Escape closes dialogs.

## Connected workflow

Create a goal, connect a project, then assign tasks to it. Mark up to three tasks as daily priorities. A task's play button opens an associated focus session. Pause, resume, reset, and complete sessions; elapsed focus minutes roll up to the task and analytics. Completed tasks update their project and connected goal automatically. Goals without projects use their numeric current/target values.

Tasks support editing, scheduling, estimates, priorities, subtasks, archive, list filters, and a drag-and-drop board. Goals and projects expose connected progress. Daily habits include a seven-day check-in grid and calculated streaks. Calendar offers month, week, and day views with scheduled tasks and manual events. Notes, journal, and daily/weekly reflections are stored alongside the workspace. Analytics uses recorded sessions and completions, including demo records when demo data is loaded.

Customize the dashboard to hide, restore, collapse, widen, and drag cards into a new order; the move-earlier button also supports keyboard reordering. Settings contains appearance, focus durations, backup export/restore, demo loading, and confirmed workspace deletion. Task deletion archives the task instead. Back up before clearing browser data: IndexedDB is local persistence, not cloud sync. Imported backups replace the workspace after confirmation.

## GitHub Pages

In repository **Settings → Pages**, select **GitHub Actions** as the source. Push to `main` or run the Deploy to GitHub Pages workflow manually. The workflow installs locked dependencies, runs tests, builds, and deploys `dist`. Deployment has not been triggered by local development.

Vite uses relative asset paths (`base: './'`), so the build works under `https://USERNAME.github.io/REPOSITORY/`. Navigation is client state rather than server paths, so refresh does not require a routing fallback.

## Current boundaries

This initial implementation covers the connected daily workflow. Advanced roadmap capabilities remain: recurring tasks and habits with custom frequency, milestone timelines, tags, automatic break sequencing and notifications, time-block dragging, individual CSV exports, advanced goal pacing and review automation, and offline installation. Focus history, workspace data, and active timer deadlines persist across refresh. The calendar has manual events and scheduled tasks; external providers are not connected.

Google Fonts is used only for typography and falls back to system sans serif; productivity data is never sent to it. There are no application analytics or API requests. Automated data tests and browser workflow validation cover the implemented core; the full product roadmap is not claimed complete.
