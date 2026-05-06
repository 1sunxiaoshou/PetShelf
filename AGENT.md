# PetShelf Agent Guide

This file records the product, architecture, and coding rules for PetShelf. Keep it updated when decisions change.

## Product Rules

- PetShelf is a lightweight web resource shelf for Codex-compatible pets.
- The app only accepts original pet folders, not Zip files.
- A valid pet folder follows the `hatch-pet` Codex Pet Contract:
  - `pet.json`
  - `spritesheet.webp`
- `pet.json` must include `id`, `displayName`, `description`, and `spritesheetPath`.
- The spritesheet atlas must be `1536x1872`, 8 columns x 9 rows, with `192x208` cells and transparent background.
- Store original folder files. If users need an archive, assemble it at download/export time.
- The home page remains light: search, sort buttons, upload, docs, user panel, pet cards.
- Do not add a global left sidebar to the home page.
- Put `我的上传` and `我的点赞` inside the user panel.
- Do not add category/tag/filter fields unless the product decision changes.
- No review or approval workflow for MVP.

## Architecture

- Frontend stack: React + Vite.
- Keep `src/App.jsx` as composition and page state only.
- Put reusable UI in `src/components/`.
- Put static demo/product data in `src/data/`.
- Put shared constants in `src/constants/`.
- Put pure helpers and browser-side validation logic in `src/utils/`.
- Put styles under `src/styles/`, split by responsibility:
  - `global.css`: reset, tokens, base elements.
  - `layout.css`: page shell, header, main, footer, responsive layout.
  - `components.css`: reusable component classes.
- Avoid adding state management libraries until real shared state appears.
- Avoid adding routing until there is a real second app page. Static markdown docs can remain linked directly for now.

## Component Rules

- Components should be small and named by product role: `AppHeader`, `PetCard`, `UploadDialog`, `UserPanel`.
- Keep file upload parsing out of UI components. Use `utils/uploadValidation.js`.
- Keep display formatting out of components when shared. Use `utils/format.js`.
- Use existing card fields on the home page: pet image, name, author, downloads, likes.
- Use lucide-react icons for standard UI icons.
- Pixel pet preview art in the current MVP is a temporary UI stand-in until real spritesheet rendering is added.

## Styling Rules

- Keep the visual style light, clean, and utilitarian.
- Use 8px radius for cards and standard controls unless a component needs a stronger reason.
- Avoid nested cards.
- Keep text inside buttons and compact panels from wrapping awkwardly.
- Do not introduce decorative gradient blobs, large marketing heroes, or heavy landing-page sections.
- Preserve the top bar structure: brand, search, upload, docs, notification, user avatar.
- Mobile layout should collapse predictably without horizontal overflow.

## Upload Rules

- Upload entry is a single `上传` button.
- Clicking upload opens a folder picker via a directory file input.
- Validate locally before showing confirmation:
- folder size is less than 10 MB
- folder contains `pet.json`
- `pet.json` parses as JSON
- required manifest fields exist
- `spritesheetPath` resolves to a real file
- spritesheet is PNG or WebP
- spritesheet dimensions match the Codex atlas contract
- spritesheet has transparent pixels
- The user-visible validation summary must stay compact: only `文件夹大小`, `pet.json`, and `spritesheet`.
- On success, hide validation details and show pet information instead.
- Confirmation is disabled when validation fails.
- Backend upload later should repeat the same validation server-side.

## Git Workflow

- Main branch: `main`.
- Run `npm run build` before committing meaningful frontend changes.
- Do not commit `node_modules/`, `dist/`, local env files, or generated debug artifacts.
- Keep commits focused and descriptive.
