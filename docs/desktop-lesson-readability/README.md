# Desktop lesson readability

The preceding source could reduce a short lesson to 12px when the desktop browser viewport was only 548px high. The header and course context consumed most of the available height; the existing fitter then shrank the phrase, phonetic guide and meaning together.

The desktop lesson now keeps a clear text hierarchy: the study phrase is 36–52px, the phonetic guide 28–36px, and the meaning 26–34px. On a short desktop viewport, the lesson header uses less vertical space. The translucent phonetic band, ear, adjacent listening and navigation controls, centered 920px course, and legal links remain.

If a long phrase or the Chinese reading control cannot fit, the course content can scroll while preserving readable type. The next phrase starts at the top. Resizing back to a larger viewport restores the regular card; switching to mobile restores the existing mobile fitter. Theme pages keep their preceding layout.

## Validation

Run from the repository root:

```sh
DESKTOP_LESSON_READABILITY_REPORT_DIR=/tmp/melunga-desktop-readability \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
node melunga_deploy/tests/desktop-lesson-readability.browser.cjs
```

`acceptance.json` records 16 cases against the actual HTML, scripts, CSS and course content. API status, voice catalogue and media are explicit local fixtures; there are no real account, payment or audio-provider requests.

- The actual preceding source at commit `5f8298b26d0c4e7b9530706579ce8b1b09ee229b` reproduces 12/12/12px at 1218×548. The new rendering is 36/28/26px, with all actions visible and a bottom margin.
- Desktop sizes include 1101×480, 1280×600, 1366×768 and 1920×1080, plus English/Japanese and Korean/French courses.
- Actual Chinese with Pinyin and a long level-8 Spanish card verify scrolling, reachable controls, Next returning to the top, and desktop/mobile breakpoint restoration.
- Storage failures at desktop heights 548px, 500px and 350px keep the retry actions visible, including a short-viewport resize. A successful explicit retry validates the card and starts the next phrase at the top.
- Two mobile lesson renderings and two desktop theme renderings are compared pixel for pixel with the preceding published source.
- The report fingerprints the browser test and 168 runtime inputs and verifies that they remain unchanged throughout the run.

These are Chromium tests with viewport and touch emulation. Physical phones and Safari were not tested.

## Captures

- `ordinateur-avant.png`: actual preceding source at 1218×548.
- `ordinateur-apres.png`: corrected short desktop viewport.
- `ordinateur-1366.png`: regular laptop viewport.
- `chinois-pinyin-haut.png` / `chinois-pinyin-actions.png`: readable Chinese and reachable lower actions.
- `phrase-longue-haut.png` / `phrase-longue-actions.png`: full long card reached through the real course.
- `erreur-enregistrement-548.png`, `erreur-enregistrement-500.png`, and `erreur-enregistrement-350.png`: actual blocked storage write with the retry actions still reachable.
