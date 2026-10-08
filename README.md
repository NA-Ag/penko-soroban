# Penko Soroban

Learn the Japanese abacus step by step, then use it for mental math. Penko the penguin teaches you, from your first bead to Flash Anzan.

**Live:** https://soroban.penkosoftware.org/

Free and open source (GPL-3.0). No account, no ads, no tracking: everything stays on your device, and it works offline. The app keeps only which lessons you've finished and which exams you've passed. It never records when or how much you practise.

## What's inside

- **A full course, 9 units and 31 lessons.** You start by meeting the beads, then learn direct moves, small friends (5-complements), big friends (10-complements), both friends at once, bigger numbers, multiplication and division. It ends with the soroban in your head (anzan). In each lesson Penko explains, then lights up the beads to move. Practice problems check every move as you make it.
- **Practice.** Abacus and mental drills you set up yourself (moves, operations, digits, list length), multiplication, division, times tables and a friends quiz. Each session shows how it went, and nothing is saved.
- **Mental math.** Flash Anzan with presets, adjustable speed and an optional beep, plus "Picture the soroban", where you read an abacus from memory.
- **Exams from 10 Kyu to 5 Dan.** They follow the style of Japanese soroban grading, with problems on the soroban, mental math and Flash Anzan. Passing earns a certificate. They track your own progress; they aren't an official qualification.
- **Progress.** A stamp card for the lessons you've finished, and your certificates. That's all the app remembers: no streaks, scores, timings or activity history. You can back up and restore it as a file.
- **16 languages:** English, Español, Français, Deutsch, Italiano, Português, Polski, Türkçe, Русский, Українська, हिन्दी, Bahasa Indonesia, Tiếng Việt, 中文, 日本語, 한국어.
- **Accessible and comfortable.** The abacus works with the keyboard (arrow keys, H for the heaven bead) and a screen reader. It has light (washi) and dark (lacquer) themes, respects reduced motion, and is sized for phones.
- **Installable, offline from the first visit.** Fonts and everything else are bundled, nothing loads from a CDN.

## How the teaching works

`core/abacus.ts` models the soroban and plans every addition and subtraction the way it's taught in Japan. It works one digit at a time, highest place first, using:

| Technique | Example | Moves |
| --- | --- | --- |
| Direct | 2 + 1 | push one earth bead up |
| Small friend (5) | 4 + 1 | add 5, take away 4 |
| Big friend (10) | 7 + 5 | take away 5, add 1 on the left |
| Both friends | 5 + 6 | take away 4 using a small friend (add 1, take away 5), add 1 on the left |

Carries and borrows ripple left (99 + 1, 1000 − 1). `core/tracker.ts` follows the learner's moves. Any order works and any size of flick. It knows when the learner is on a good path, what the next move is (for hints), and when they've gone off course. `core/problems.ts` generates problems that need exactly the techniques a lesson teaches. The lessons themselves are data in `core/lessons.ts`, and Penko's words are in the language files.

## Development

Requires Node.js 22.22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine, course content and translation checks
npm run build      # type-check and build into dist/
```

`npm run generate-icons` redraws the favicon and app icons from the Penko sprite.

### Project structure

```
core/         Soroban engine, move tracker, problem generators, lessons, exams, progress
components/   Abacus, Penko, seals, shared UI and the problem runners
views/        Learn, lesson player and activities, Practice, Mental math, Exams, Progress, Settings
i18n/         Language loader; locales/en.ts is the source text, one file per language
penko_anim/   Penko's 16x16 animation frames (shared with the other Penko apps)
scripts/      Icon generator
tests/        Vitest suites
```

### Translating

`i18n/locales/en.ts` is the source; its header has notes for translators. Every other file in `i18n/locales/` must have exactly the same keys and keep every `{placeholder}`. `npm test` checks both, and flags sentences left in English.

## Deployment

Pushing to `main` runs the tests, builds, and deploys to GitHub Pages at soroban.penkosoftware.org (`.github/workflows/deploy.yml`).

## License

GPL-3.0. See [LICENSE.md](LICENSE.md).
