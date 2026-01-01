# USSD React Native (Expo)

A minimal Expo app that displays USSD providers and their codes.

Prerequisites:

- Node.js installed
- `npm` or `yarn`
- Expo CLI (optional; `npx expo` works)

Run locally:

```bash
cd rn
npm install
npx expo start
```

Then open on your device via Expo Go or run in emulator.

Notes:

- The app reads data from the existing project file `src/components/data/verified-ussd-codes.ts` via a small data bridge in `rn/src/data/index.ts`.
- USSD dialing is done via `Linking.openURL('tel:...')` with `#` encoded as `%23`.
- If you want the RN app to be independent, copy `src/components/data/verified-ussd-codes.ts` into the `rn/src/data/` folder and update the import in `rn/src/data/index.ts`.
