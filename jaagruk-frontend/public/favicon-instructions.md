# Favicon Generation Instructions for Jaagruk

Please follow these steps to add the app icons to the project manually:

1. **Export the AppIcon**:
   - Take the SVG code of the `AppIcon` component in [Logo.tsx](file:///d:/OOPs/Jaagruk/jaagruk-frontend/src/components/ui/Logo.tsx) (the eye mark).
   - Render it or export it using an SVG converter tool.

2. **Generate Icon Files**:
   - **favicon.ico**: Convert the SVG to an `.ico` format with a standard `32x32` pixel resolution.
   - **apple-touch-icon.png**: Export the SVG as a high-quality `.png` format with a `180x180` pixel resolution.

3. **Deploy to Public Folder**:
   - Copy `favicon.ico` directly into the `d:\OOPs\Jaagruk\jaagruk-frontend\public\` folder.
   - Copy `apple-touch-icon.png` directly into the `d:\OOPs\Jaagruk\jaagruk-frontend\public\` folder.

Next.js will automatically detect and serve these assets to standard search crawlers and bookmark bars.
