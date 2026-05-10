import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    Conseil: {
      render: component('./src/components/content/Conseil.astro'),
      attributes: {
        titre: { type: String, default: 'Mon conseil' },
      },
    },
    MonAvis: {
      render: component('./src/components/content/MonAvis.astro'),
      attributes: {
        sentiment: {
          type: String,
          default: 'positif',
          matches: ['positif', 'negatif', 'mitige'],
        },
      },
    },
    EnPratique: {
      render: component('./src/components/content/EnPratique.astro'),
      attributes: {
        titre: { type: String, default: 'En pratique' },
      },
    },
    FAQ: {
      render: component('./src/components/content/FAQ.astro'),
      attributes: {
        titre: { type: String, default: 'Questions fréquentes' },
        items: { type: Array, required: true },
      },
    },
    Embed: {
      render: component('./src/components/content/Embed.astro'),
      attributes: {
        src: { type: String, required: true },
        titre: { type: String, required: true },
        hauteur: { type: Number, default: 400 },
        allowFullscreen: { type: Boolean, default: false },
      },
    },
    RawHTML: {
      render: component('./src/components/content/RawHTML.astro'),
      attributes: {
        html: { type: String, required: true },
      },
    },
  },
});
