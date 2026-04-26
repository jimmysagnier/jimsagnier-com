# jimsagnier.com

> L'Atelier de Jim Sagnier — site personnel.

Atelier ouvert où Jim documente ce qu'il construit, apprend et transmet autour de trois territoires : **Construire**, **Comprendre**, **Réfléchir**.

## Stack

- [Astro](https://astro.build) (hybrid, TypeScript strict)
- CSS artisanal — pas de framework
- Hébergement : [Cloudflare Pages](https://pages.cloudflare.com)
- Domaine : [jimsagnier.com](https://jimsagnier.com)

## Développement

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # build de production dans ./dist
npm run preview  # preview du build
```

## Structure

```
src/
├── pages/        # routes (Accueil, Journal, Projets, À propos)
├── layouts/      # layouts partagés
├── components/   # composants Astro
└── content/      # articles MDX (à venir)
public/           # assets statiques
```

## Direction artistique

**Contrast Split** — dark `#09090B` / light `#FAFAFA` / cyan accent `#06B6D4`.
Inter/Satoshi en typo principale. Logo `JS_` avec underscore clignotant.

---

© Jim Sagnier
