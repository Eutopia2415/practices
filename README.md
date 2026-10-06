# Practice Room · AP Practices

[Open the classroom lobby](https://eutopia2415.github.io/practices/) to choose **AP Literature** or **AP Business**, filter practice and assessments, search, and save activities. Calculus is hidden from the lobby for now; existing files and direct links are retained.

The lobby tracks saved and recently opened activities in this browser; it does not infer completion. Submitted results are stored separately in the private statistics service.

These original practice quizzes run in the browser. Open a link below to start; in-progress answers are stored locally in that browser; submitted grades are sent to the private statistics service.

## English · AP Literature

- [Ode to the West Wind](https://eutopia2415.github.io/practices/English/Ode%20to%20the%20West%20Wind.html) ([file](English/Ode%20to%20the%20West%20Wind.html))
- [To Autumn](https://eutopia2415.github.io/practices/English/To%20Autumn.html) ([file](English/To%20Autumn.html))
- [To Autumn · Custom Practice](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Custom%20Practice.html) ([file](English/To%20Autumn%20-%20Custom%20Practice.html))
- [To Autumn · New Medium-Hard Test](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20New%20Medium-Hard%20Test.html) ([file](English/To%20Autumn%20-%20New%20Medium-Hard%20Test.html))
- [To Autumn · Surprise Mock](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Surprise%20Mock.html)
- [To Autumn · Clean Practice](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Clean%20Practice.html) ([file](English/To%20Autumn%20-%20Clean%20Practice.html))

The [Practice Room lobby](https://eutopia2415.github.io/practices/) opens the subject dashboard. [Poem source](https://poets.org/poem/autumn).

## Business · Unit 1

- [Unit 1 · Full practice test · October 6](https://eutopia2415.github.io/practices/Business/AP%20Business%20Unit%201%20Full%20Test%202026-10-06.html) — 40 original questions across eight cases, five per topic (1.1–1.8). Untimed, saved progress, review flags, explanations after submission, and topic scores. Aligned to the assigned BFW Unit 1 textbook and the [Fall 2026 College Board CED](https://apcentral.collegeboard.org/media/pdf/ap-business-personal-finance-course-and-exam-description.pdf); not an official exam.

- [AP Business Unit 1 Practice](https://eutopia2415.github.io/practices/Business/AP%20Business%20Unit%201%20Practice.html) ([file](Business/AP%20Business%20Unit%201%20Practice.html))
- [AP Business Unit 1 Worksheet · September 24](https://eutopia2415.github.io/practices/Business/AP%20Business%20Unit%201%20Worksheet%202026-09-24.html) ([file](Business/AP%20Business%20Unit%201%20Worksheet%202026-09-24.html)) — 18 untimed questions on Topics 1.1–1.3.

## Maintaining the lobby

`index.html`, `lobby.css`, and `lobby.js` provide the static GitHub Pages dashboard. Add student-facing activities to the `activities` catalog in `lobby.js`; keep answer keys and author banks out of this catalog. Update the subject counts in `index.html` when adding activities. Subject views support direct links with `#lit` and `#business`.

Each Literature and Business quiz includes a direct Back to dashboard link, beside Colors where that control is available. `practice-ui.css` shares the return-button styling and loading skeletons. Initial dashboard rows and quiz question placeholders are replaced by the existing renderers as soon as content is ready; practice pages show a brief 850 ms entrance skeleton, and animation respects reduced-motion preferences.

Overview shows subject cards and recently opened activities. The full searchable catalog lives in the separate Activity library tab (`#all`); subject and saved views retain their own filtered lists. Decorative captions are omitted. Activity subtitles briefly identify the unit or poetry focus and covered topics.

Dashboard views and quizzes show an 850 ms skeleton once per page per tab session. Refreshing replays the entrance. Revisiting within the same tab skips it; closing the tab and opening a fresh one resets it through sessionStorage. Quiz answers and bookmarks remain in their existing storage.

Activity `postedAt` timestamps use the first commit adding that public file to this repository (a historical publication proxy, not an exact Pages deployment timestamp). Dates and times display in Asia/Bangkok (ICT), consistently in the library and Recently opened. Preserve these timestamps on edits.


## Private statistics

Students do not sign in. Each browser receives a random local identifier; no hardware serial number or fingerprint is collected. Clearing browser storage, private browsing, or switching browsers creates a new device. Multiple people sharing one browser appear under the same device label.

`gradebook.html` displays submitted attempts, device counts, overall accuracy, average time, and per-question results. Access requires a secret link. The owner can generate separately revocable read-only links. Anyone possessing a link can use it, so keep the owner link private. The raw access key is removed from the address bar after opening and kept in sessionStorage; only its SHA-256 digest is stored on the backend. Ordinary visitors and student device tokens cannot read statistics. Revocation prevents future reads; it cannot erase copies someone already made.

The backend regrades submitted answers and makes completed submissions immutable. The original static quizzes contain public answer keys, so this is a practice system rather than a proctored assessment. Device identifiers and browser-reported time are not proof of a person's identity or tamper-proof attendance. Students see their local scores immediately, even if an upload fails; a retry keeps their saved answers.

The hidden timer counts visible-page time, excludes the entrance skeleton, pauses when the tab is hidden or closed, survives refreshes, and freezes on submission. Older submitted attempts show time unavailable. Older unfinished attempts show partial time. The server caps reported active time at time elapsed since the attempt was first connected; offline starts can therefore be marked partial.

### Maintenance

- Run `npm ci`, `npm test`, `npx tsc --noEmit`, and `npm run build:client`.
- `convex/` contains the schema, grading, aggregate counters, and server-side access checks. Deploy with `npx convex deploy`. Public `cloud-config.js` points to the production deployment; it contains no access keys.
- `OWNER_TOKEN_HASH` is a deployment environment variable containing the SHA-256 hex digest of a cryptographically random 32-byte key (64 lowercase hex characters). Set it separately for dev and production. Never commit the raw key or put it in public config. Rotate it to invalidate an owner link. Existing viewer links can be revoked individually from the owner page.
- The owner key and its private link are saved locally outside published site files. `.env*` files are ignored by Git. Back up the private link securely.
- When quiz questions change, run `python3 scripts/build-catalog.py`, review `convex/catalog.json`, test, and deploy the backend together with the quiz changes. Avoid changing question banks mid-attempt.
- `scripts/smoke-backend.mjs` is deliberately pinned to the development deployment. It creates synthetic practice results there and checks submission, grading, sharing, and revocation; it never writes test results to production.
