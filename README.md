# Daylist

A responsive, dependency-free to-do list application built with HTML, CSS, and JavaScript. This branch implements the to-do application requested after the repository bootstrap; the Java/Playwright framework has not been implemented here.

## Run locally

From this repository, serve the files with any static HTTP server. For example, with Python 3 installed:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. No build step, package installation, backend, or account is required. Use an HTTP server rather than opening `index.html` directly, since browser storage behavior for `file:` URLs varies.

## Features

- Add, edit, delete, and complete tasks (up to 250 characters per title).
- All, active, and completed filters; remaining-task count and progress indicator.
- Clear completed tasks with confirmation.
- Local persistence under the `daylist.tasks.v1` browser storage key.
- Cross-tab updates, with last-write-wins behavior (not transactional collaboration).
- Responsive light/dark styling, keyboard controls, visible focus, accessible labels, and live status announcements.
- Empty states and visible storage-error warnings. Malformed stored data is not silently overwritten.
- User-entered task text is rendered as text, never interpreted as HTML.

## Files

- `index.html`: semantic application markup.
- `styles.css`: responsive layout, themes, reduced-motion support.
- `app.js`: task state, rendering, interaction, validation, and storage.

## Storage and privacy

Tasks are stored only in this browser profile for this origin (scheme, hostname, and port). They do not sync to another device. Clearing site data removes them; private browsing or blocked/full storage can prevent saving. Do not treat browser storage as encrypted or use this demo to store secrets. Other scripts on the same origin can access it.

If saved data is corrupt or unsupported, the app displays a warning and permits temporary in-memory use without overwriting the original data. To recover, first back up the `daylist.tasks.v1` value in browser developer tools, then remove that key and reload. Failed writes are reported; subsequent changes retry saving.

## Manual acceptance checklist

1. Add a task; reload and confirm it persists.
2. Try an empty/whitespace-only task; confirm validation. Add text such as `<b>hello</b>`; confirm it stays literal text.
3. Complete and reopen a task; verify counts, progress, filters, and persistence.
4. Edit a task; save with Enter. Cancel another edit using Cancel or Escape.
5. Delete an active task; clear completed tasks and test both confirmation choices.
6. Open a second tab on the same origin; verify updates appear in it.
7. Resize to a mobile viewport; navigate with Tab, Enter, and Space.
8. Set the storage key to malformed JSON in developer tools, then reload; confirm a warning and no overwrite. Back up/remove that entry to reset.
9. Block browser storage and verify a warning appears rather than an application crash.

## Validation status

The files have been authored through the GitHub API. Browser execution and automated tests have not been run in this session; the checklist above is provided for verification, not as a claim of passing tests.
