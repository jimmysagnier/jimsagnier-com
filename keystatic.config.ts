import { config, fields, collection, singleton } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: "L'Atelier de Jim Sagnier" },
    navigation: {
      Contenu: ['articles', 'projets'],
      Configuration: ['settings'],
    },
  },

  collections: {
    articles: collection({
      label: 'Articles du Journal',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'territory', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Titre',
            validation: { length: { min: 1, max: 120 } },
          },
        }),

        territory: fields.select({
          label: 'Territoire',
          options: [
            { label: 'Construire', value: 'construire' },
            { label: 'Comprendre', value: 'comprendre' },
            { label: 'Réfléchir', value: 'reflechir' },
          ],
          defaultValue: 'construire',
        }),

        publishedAt: fields.date({
          label: 'Publié le',
          validation: { isRequired: true },
        }),

        scheduledPublishAt: fields.date({
          label: 'Programmé pour publication le',
          description: 'Optionnel — si défini, l\'article ne sera visible qu\'à partir de cette date.',
        }),

        updatedAt: fields.date({
          label: 'Mis à jour le',
          description: 'Optionnel — sert au schema markup `dateModified`.',
        }),

        summary: fields.text({
          label: 'Résumé',
          description: 'Chapô de l\'article + meta description par défaut (~155 caractères, max 220).',
          multiline: true,
          validation: { length: { min: 50, max: 220 } },
        }),

        readingTime: fields.integer({
          label: 'Temps de lecture (min)',
          description: 'Estimé. Sert pour le bloc Essentiel et la meta pill.',
        }),

        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
          description: 'Mots-clés affichés en pied d\'article et utilisés pour filtrer le Journal.',
        }),

        essentiel: fields.object(
          {
            sousTitre: fields.text({
              label: 'Sous-titre',
              defaultValue: 'Les points essentiels.',
            }),
            readingTime: fields.text({
              label: 'Reading time label',
              description: 'Ex: "3 min · ou 12 min en entier"',
            }),
            items: fields.array(fields.text({ label: 'Bullet' }), {
              label: 'Points essentiels',
              itemLabel: (props) => props.value.slice(0, 60),
              description: 'Bullets visibles dans le bloc L\'essentiel.',
            }),
          },
          {
            label: 'L\'essentiel (bloc en tête d\'article)',
            description: 'Affiché au-dessus du contenu. Laisser vide si pas pertinent.',
          }
        ),

        coverImage: fields.object(
          {
            src: fields.image({
              label: 'Image de couverture',
              directory: 'public/images/articles',
              publicPath: '/images/articles/',
              validation: { isRequired: true },
            }),
            alt: fields.text({
              label: 'Texte alternatif (alt)',
              description: 'Décris l\'image pour l\'accessibilité et le SEO.',
              validation: { length: { min: 1 } },
            }),
            caption: fields.text({
              label: 'Légende (optionnelle)',
            }),
          },
          { label: 'Image de couverture' }
        ),

        relatedProject: fields.relationship({
          label: 'Projet lié',
          description: 'Optionnel — rattache l\'article à un projet existant.',
          collection: 'projets',
        }),

        seo: fields.object(
          {
            title: fields.text({
              label: 'Titre SEO',
              description: 'Override du <title>. Vide = utilise le titre principal.',
            }),
            description: fields.text({
              label: 'Meta description',
              description: 'Override de la description. Vide = utilise le résumé.',
              multiline: true,
            }),
            ogImage: fields.image({
              label: 'Image Open Graph',
              description: 'Image partagée sur réseaux. Vide = utilise la couverture.',
              directory: 'public/images/og',
              publicPath: '/images/og/',
            }),
            schemaType: fields.select({
              label: 'Type de schema markup',
              description: 'BlogPosting par défaut. HowTo pour un tutoriel pas-à-pas, FAQPage pour Q/R.',
              options: [
                { label: 'BlogPosting (par défaut)', value: 'BlogPosting' },
                { label: 'HowTo (tutoriel)', value: 'HowTo' },
                { label: 'FAQPage (questions/réponses)', value: 'FAQPage' },
              ],
              defaultValue: 'BlogPosting',
            }),
            noindex: fields.checkbox({
              label: 'Empêcher l\'indexation (noindex)',
              defaultValue: false,
            }),
          },
          { label: 'SEO & Schema' }
        ),

        howTo: fields.object(
          {
            totalTime: fields.text({
              label: 'Durée totale (ex: PT30M)',
              description: 'Format ISO 8601 — PT30M = 30 minutes, PT2H = 2h.',
            }),
            steps: fields.array(
              fields.object({
                name: fields.text({ label: 'Étape (titre)' }),
                text: fields.text({ label: 'Description', multiline: true }),
              }),
              {
                label: 'Étapes',
                itemLabel: (props) => props.fields.name.value || '(sans nom)',
              }
            ),
          },
          {
            label: 'HowTo (si schema = HowTo)',
            description: 'À remplir uniquement si le type de schema est HowTo.',
          }
        ),

        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Réponse', multiline: true }),
          }),
          {
            label: 'FAQ (si schema = FAQPage)',
            description: 'À remplir uniquement si le type de schema est FAQPage.',
            itemLabel: (props) => props.fields.question.value || '(sans question)',
          }
        ),

        draft: fields.checkbox({
          label: 'Brouillon',
          description: 'Si coché, l\'article ne sera pas publié.',
          defaultValue: true,
        }),

        featured: fields.checkbox({
          label: 'À la une',
          description: 'Si coché, apparaît dans le bloc featured de l\'accueil.',
          defaultValue: false,
        }),

        body: fields.markdoc({
          label: 'Contenu',
          options: {
            image: {
              directory: 'public/images/articles',
              publicPath: '/images/articles/',
            },
          },
          components: {
            Conseil: wrapper({
              label: 'Conseil de Jim',
              description: 'Encart EEAT — un conseil pratique encadré.',
              schema: {
                titre: fields.text({
                  label: 'Titre du conseil',
                  defaultValue: 'Mon conseil',
                }),
              },
            }),

            MonAvis: wrapper({
              label: 'Mon avis',
              description: 'Encart EEAT — opinion personnelle avec sentiment.',
              schema: {
                sentiment: fields.select({
                  label: 'Sentiment',
                  options: [
                    { label: '👍 Positif', value: 'positif' },
                    { label: '👎 Négatif', value: 'negatif' },
                    { label: '🤔 Mitigé', value: 'mitige' },
                  ],
                  defaultValue: 'positif',
                }),
              },
            }),

            EnPratique: wrapper({
              label: 'En pratique',
              description: 'Encart EEAT — exemple ou cas concret vécu.',
              schema: {
                titre: fields.text({
                  label: 'Titre',
                  defaultValue: 'En pratique',
                }),
              },
            }),

            FAQ: block({
              label: 'FAQ inline',
              description:
                'Liste questions/réponses. Génère automatiquement le schema markup FAQPage.',
              schema: {
                titre: fields.text({
                  label: 'Titre du bloc (optionnel)',
                  defaultValue: 'Questions fréquentes',
                }),
                items: fields.array(
                  fields.object({
                    question: fields.text({ label: 'Question' }),
                    reponse: fields.text({
                      label: 'Réponse',
                      multiline: true,
                    }),
                  }),
                  {
                    label: 'Questions',
                    itemLabel: (p) => p.fields.question.value || '(sans question)',
                  }
                ),
              },
            }),

            Embed: block({
              label: 'Embed (iframe)',
              description: 'Intègre un outil ou une page externe via iframe.',
              schema: {
                src: fields.url({
                  label: 'URL de l\'iframe',
                  description: 'Peut être une page de ton site (ex: /tools/calculateur) ou un service externe.',
                  validation: { isRequired: true },
                }),
                titre: fields.text({
                  label: 'Titre accessibilité',
                  description: 'Décrit ce que contient l\'iframe pour les lecteurs d\'écran.',
                  validation: { length: { min: 1 } },
                }),
                hauteur: fields.integer({
                  label: 'Hauteur (px)',
                  defaultValue: 400,
                }),
                allowFullscreen: fields.checkbox({
                  label: 'Autoriser le plein écran',
                  defaultValue: false,
                }),
              },
            }),

            RawHTML: block({
              label: 'HTML / JS brut',
              description:
                'Colle du HTML ou JS direct. À utiliser avec parcimonie — préfère un Embed quand possible.',
              schema: {
                html: fields.text({
                  label: 'Code HTML/JS',
                  multiline: true,
                  validation: { length: { min: 1 } },
                }),
              },
            }),
          },
        }),
      },
    }),

    projets: collection({
      label: 'Projets',
      slugField: 'title',
      path: 'src/content/projets/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'status', 'year'],
      schema: {
        title: fields.slug({
          name: { label: 'Nom du projet' },
        }),

        color: fields.select({
          label: 'Couleur thème',
          options: [
            { label: 'Cyan', value: 'cyan' },
            { label: 'Warm (orange)', value: 'warm' },
            { label: 'Purple', value: 'purple' },
            { label: 'Green', value: 'green' },
            { label: 'Pink', value: 'pink' },
          ],
          defaultValue: 'cyan',
        }),

        status: fields.select({
          label: 'Statut',
          options: [
            { label: 'En cours', value: 'en-cours' },
            { label: 'Live', value: 'live' },
            { label: 'En entretien', value: 'entretien' },
            { label: 'Terminé', value: 'termine' },
            { label: 'Archivé', value: 'archive' },
          ],
          defaultValue: 'en-cours',
        }),

        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Work (Eurofiscalis)', value: 'work' },
            { label: 'Perso', value: 'perso' },
            { label: 'Coup de main', value: 'coup-de-main' },
            { label: 'Outil', value: 'outil' },
          ],
          defaultValue: 'perso',
        }),

        year: fields.text({
          label: 'Année(s)',
          description: 'Ex: 2026 ou 2025–26',
        }),

        role: fields.text({
          label: 'Rôle / sous-titre',
          description: 'Ex: Acquisition · SEO · contenu',
        }),

        summary: fields.text({
          label: 'Histoire courte',
          multiline: true,
          validation: { length: { min: 50 } },
        }),

        subProjects: fields.array(
          fields.object({
            title: fields.text({ label: 'Nom du sous-projet' }),
            description: fields.text({ label: 'Courte description', multiline: true }),
          }),
          {
            label: 'Sous-projets',
            itemLabel: (props) => props.fields.title.value || '(sans nom)',
          }
        ),

        stack: fields.array(fields.text({ label: 'Tech' }), {
          label: 'Stack technique',
          itemLabel: (props) => props.value,
        }),

        progress: fields.integer({
          label: 'Progression (%)',
          validation: { min: 0, max: 100 },
        }),

        coverImage: fields.object(
          {
            src: fields.image({
              label: 'Image',
              directory: 'public/images/projets',
              publicPath: '/images/projets/',
            }),
            alt: fields.text({ label: 'Texte alternatif (alt)' }),
          },
          { label: 'Image' }
        ),

        archived: fields.checkbox({
          label: 'Archivé',
          description: 'Si coché, le projet apparaît en section archives.',
          defaultValue: false,
        }),

        order: fields.integer({
          label: 'Ordre d\'affichage',
          defaultValue: 0,
        }),

        seo: fields.object(
          {
            title: fields.text({ label: 'Titre SEO' }),
            description: fields.text({ label: 'Meta description', multiline: true }),
            ogImage: fields.image({
              label: 'Image Open Graph',
              directory: 'public/images/og',
              publicPath: '/images/og/',
            }),
          },
          { label: 'SEO' }
        ),

        body: fields.markdoc({
          label: 'Description longue',
          options: {
            image: {
              directory: 'public/images/projets',
              publicPath: '/images/projets/',
            },
          },
        }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Paramètres du site',
      path: 'src/content/settings/site',
      schema: {
        title: fields.text({
          label: 'Titre du site',
          defaultValue: "L'Atelier de Jim Sagnier",
        }),
        tagline: fields.text({
          label: 'Tagline',
          defaultValue: "L'atelier d'un Lead acquisition qui écrit et qui vibecode.",
        }),
        description: fields.text({
          label: 'Description du site',
          multiline: true,
          defaultValue:
            "Acquisition B2B, IA, SEO et expérimentation web. Le journal d'un responsable acquisition qui code à côté.",
        }),
        baseUrl: fields.url({
          label: 'URL canonique',
          defaultValue: 'https://jimsagnier.com',
        }),
        defaultOgImage: fields.image({
          label: 'Image Open Graph par défaut',
          directory: 'public/images/og',
          publicPath: '/images/og/',
        }),
        sameAs: fields.array(
          fields.object({
            platform: fields.text({ label: 'Plateforme' }),
            url: fields.url({ label: 'URL' }),
          }),
          {
            label: 'Liens sociaux (sameAs pour schema Person)',
            description: 'GitHub, LinkedIn, X, Substack, etc.',
            itemLabel: (props) => props.fields.platform.value || '(sans nom)',
          }
        ),
      },
    }),
  },
});
