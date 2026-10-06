# Practice Room · AP Practices

[Open the classroom lobby](https://eutopia2415.github.io/practices/) to choose **AP Literature** or **AP Business**, filter practice and assessments, search, and save activities. Calculus is hidden from the lobby for now; existing files and direct links are retained.

The lobby tracks saved and recently opened activities in this browser; it does not infer completion or synchronize scores.

These original practice quizzes run in the browser. Open a link below to start; progress is stored locally in that browser and does not sync across devices.

## English · AP Literature

- [Ode to the West Wind](https://eutopia2415.github.io/practices/English/Ode%20to%20the%20West%20Wind.html) ([file](English/Ode%20to%20the%20West%20Wind.html))
- [To Autumn](https://eutopia2415.github.io/practices/English/To%20Autumn.html) ([file](English/To%20Autumn.html))
- [To Autumn · Custom Practice](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Custom%20Practice.html) ([file](English/To%20Autumn%20-%20Custom%20Practice.html))
- [To Autumn · New Medium-Hard Test](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20New%20Medium-Hard%20Test.html) ([file](English/To%20Autumn%20-%20New%20Medium-Hard%20Test.html))
- [To Autumn · Surprise Mock](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Surprise%20Mock.html)
- [To Autumn · Clean Practice](https://eutopia2415.github.io/practices/English/To%20Autumn%20-%20Clean%20Practice.html) ([file](English/To%20Autumn%20-%20Clean%20Practice.html))

The [Practice Room lobby](https://eutopia2415.github.io/practices/) opens the subject dashboard. [Poem source](https://poets.org/poem/autumn).

## Business · Unit 1

- [AP Business Unit 1 Practice](https://eutopia2415.github.io/practices/Business/AP%20Business%20Unit%201%20Practice.html) ([file](Business/AP%20Business%20Unit%201%20Practice.html))
- [AP Business Unit 1 Worksheet · September 24](https://eutopia2415.github.io/practices/Business/AP%20Business%20Unit%201%20Worksheet%202026-09-24.html) ([file](Business/AP%20Business%20Unit%201%20Worksheet%202026-09-24.html)) — 18 untimed questions on Topics 1.1–1.3.

## Maintaining the lobby

`index.html`, `lobby.css`, and `lobby.js` provide the static GitHub Pages dashboard. Add student-facing activities to the `activities` catalog in `lobby.js`; keep answer keys and author banks out of this catalog. Update the subject counts in `index.html` when adding activities. Subject views support direct links with `#lit` and `#business`.

Each Literature and Business quiz includes a direct Back to dashboard link, beside Colors where that control is available. `practice-ui.css` shares the return-button styling and loading skeletons. Initial dashboard rows and quiz question placeholders are replaced by the existing renderers as soon as content is ready; practice pages show a brief 850 ms entrance skeleton, and animation respects reduced-motion preferences.

Overview shows subject cards and recently opened activities. The full searchable catalog lives in the separate Activity library tab (`#all`); subject and saved views retain their own filtered lists. Decorative captions are omitted. Activity subtitles briefly identify the unit or poetry focus and covered topics.
