# The Hidden Architects: Nature's Invisible Kingdoms

React + TypeScript conversion of the original single-page presentation, built with Vite.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

This project deploys from GitHub Actions. Pushes to the `main` branch run the
workflow in `.github/workflows/deploy.yml`, build the Vite app, and publish the
`dist` directory to GitHub Pages.

In the GitHub repository settings, set **Pages > Build and deployment > Source**
to **GitHub Actions**.

## Project Structure

```text
/
├── index.html
├── package.json
├── public/images/       # Presentation images served by Vite
├── src/
│   ├── App.tsx          # React behavior for navigation, slides, notes, carousel
│   ├── main.tsx
│   ├── pageHtml.ts      # Static presentation markup from the original site
│   └── styles.css       # Original stylesheet
├── tsconfig.json
└── vite.config.ts
```
