# OpenLingo

OpenLingo is an open-source language learning app inspired by Duolingo.

## Branch strategy

- `main`: Expo app (iOS-first development target).
- `Lessons`: Course and lesson content, curriculum specs, and learning assets.

## Project layout

- `app/`: Expo TypeScript mobile application.
- `mockups/`: HTML mockups used as design references.

## Run the app

```bash
cd app
npm install
npm run ios
```

If you are not on macOS, run `npm run web` or use Expo Go.
