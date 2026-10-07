# Enludus Company Web

Official company / studio website for **Enludus**.

A motion-rich single-page site built with Vite, React, TypeScript, and Motion. It presents three current products:

- **Career** — career decision support: https://career.enludus.com
- **StudyReel** — learning recorder for iOS
- **UsefulMap** — travel-mode comparison for iOS

## Stack

- Vite
- React 19
- TypeScript
- Motion (motion/react)
- Vanilla CSS
- Vercel

## Local development

Run npm install and npm run dev.

Production build: npm run build.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Vercel should detect Vite automatically.
3. Build command: npm run build
4. Output directory: dist
5. Add enludus.com (and optionally www.enludus.com) under Project → Settings → Domains.
6. Apply the DNS records Vercel shows for the domain.

No environment variables are required.

## Content

Product links and copy live in src/App.tsx. The visual system and responsive behavior live in src/styles.css.

The UI mockups are implemented in HTML/CSS/SVG instead of screenshots so the product storytelling remains crisp, animated, responsive, and easy to update.
