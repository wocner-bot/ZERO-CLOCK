# English-first localization

Goal: English on first visit; English, Russian and Spanish selectable in the header.

Implementation:
- Add a shared translation catalogue for UI, curated events, history and automatic feed explanations. Preserve event identifiers, source URLs, scoring and stored feed data.
- Store the chosen language locally, validate saved values, update document language/title/description, and format dates and numbers for the selected locale.
- Keep category values stable across languages. Search translated event text. Render refresh feedback from data so switching language also updates existing statuses.
- Keep external article titles in their source language and identify them as originals.
- Check translation coverage, scenario invariants, type checking, lint, build, and desktop/mobile language switching including reload persistence.

No routing or translation service is needed for this single-page application. No deployment is requested.

Verification completed:
- 11 Node tests pass, including translation completeness and unchanged scenario contributions.
- TypeScript passes. Full ESLint has no errors; the pre-existing Nixie `<img>` performance warning remains.
- Production build passes from an identical source copy at `/tmp/apocalypse-clock-language-preview`, needed because the original parent path contains `#`.
- Browser checks pass for all three languages and all tabs, English default with a Russian browser locale, document metadata, translated search/category filtering, persistence after reload, cross-tab sync, disabled storage, fetch failure feedback, and 320/390px layouts.
- Local preview: http://127.0.0.1:5173/ (temporary verification copy; implementation files match the original project).
