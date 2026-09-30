begin;

-- 1. Mise à niveau de l'actualité existante
update public.portal_content
set data = data || jsonb_build_object(
  'titleEn', 'A new perspective on LMG.',
  'categoryEn', 'Group',
  'introEn', 'Legacy Music Group introduces its Group portal: a common entry point to discover its vision, ecosystem, businesses and projects.',
  'sections', jsonb_build_array(
    jsonb_build_object(
      'title', 'Une porte d’entrée sur le groupe',
      'text', 'Le portail LMG réunit la présentation du groupe, sa vision, ses activités et une sélection de projets. Il permet de découvrir l’écosystème LMG et d’accéder aux univers de ses différentes activités.',
      'titleEn', 'An entry point into the Group',
      'textEn', 'The LMG portal brings together the Group''s presentation, vision, businesses and a selection of projects. It provides a central entry point into the LMG ecosystem and its different activities.'
    ),
    jsonb_build_object(
      'title', 'Deux activités principales',
      'text', 'LMG Music accompagne le développement des projets artistiques et intègre les activités liées au live et à l’événementiel. LMG Agency intervient sur la communication, la stratégie, la création et le digital.',
      'titleEn', 'Two core businesses',
      'textEn', 'LMG Music supports the development of artistic projects and includes live and entertainment activities. LMG Agency works across communication, strategy, creative services and digital experiences.'
    ),
    jsonb_build_object(
      'title', 'Des projets pour découvrir nos univers',
      'text', 'FLY de LAAM et l’expérience digitale de Deepa Be Yourself font partie des premiers projets présentés sur le portail. Ils donnent un aperçu concret des univers développés au sein de LMG.',
      'titleEn', 'Projects that bring our ecosystem to life',
      'textEn', 'LAAM''s FLY and the digital experience created for Deepa Be Yourself are among the first projects featured on the portal, offering a concrete look at the different worlds developed within LMG.'
    )
  )
)
where kind = 'news'
  and slug = 'un-nouveau-regard-sur-lmg';


-- 2. Nouvelle actualité LMG OS
insert into public.portal_content (
  kind,
  slug,
  status,
  data
)
values (
  'news',
  'lmg-os-bientot-au-dela-de-lmg',
  'published',
  jsonb_build_object(
    'title', 'LMG OS, bientôt au-delà de LMG.',
    'titleEn', 'LMG OS, built to go beyond LMG.',
    'category', 'Produit',
    'categoryEn', 'Product',
    'publishedAt', '2026-09-30',
    'intro', 'Initialement développé pour accompagner les opérations de LMG Group, LMG OS évolue aujourd’hui vers une plateforme de gestion d’entreprise pensée pour aller au-delà de l’écosystème LMG.',
    'introEn', 'Initially developed to support the operations of LMG Group, LMG OS is now evolving into a business management platform designed to go beyond the LMG ecosystem.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Un outil né des besoins de LMG',
        'text', 'LMG OS a d’abord été développé comme un outil interne destiné à centraliser et structurer les opérations de LMG Group. Projets, tâches, équipes, activité et différents outils de gestion ont progressivement été réunis au sein d’un même environnement.',
        'titleEn', 'Built from LMG''s own needs',
        'textEn', 'LMG OS was initially developed as an internal tool to centralize and structure the operations of LMG Group. Projects, tasks, teams, activity and different management tools have progressively been brought together within a single environment.'
      ),
      jsonb_build_object(
        'title', 'Pensé pour aller plus loin',
        'text', 'Ce qui était à l’origine un système interne évolue désormais vers une plateforme de gestion d’entreprise plus large. L’objectif est de conserver la logique qui structure les opérations de LMG tout en l’adaptant aux besoins d’autres entreprises et équipes.',
        'titleEn', 'Designed to go further',
        'textEn', 'What started as an internal system is now evolving into a broader business management platform. The objective is to preserve the operational logic developed within LMG while adapting it to the needs of other businesses and teams.'
      ),
      jsonb_build_object(
        'title', 'Une nouvelle étape en développement',
        'text', 'Une version destinée à une utilisation au-delà de LMG est actuellement en développement. LMG OS n’est pas encore disponible publiquement et cette nouvelle étape permettra de faire évoluer progressivement la plateforme vers un produit autonome.',
        'titleEn', 'A new stage in development',
        'textEn', 'A version designed for use beyond LMG is currently in development. LMG OS is not yet publicly available, and this new stage will progressively evolve the platform toward a standalone product.'
      ),
      jsonb_build_object(
        'title', 'La suite prochainement',
        'text', 'Le développement de LMG OS se poursuit. Ses fonctionnalités, son positionnement et les informations concernant sa future disponibilité seront présentés progressivement à mesure que cette nouvelle version prendra forme.',
        'titleEn', 'More to come',
        'textEn', 'Development of LMG OS continues. Its features, positioning and information regarding future availability will be shared progressively as this new version takes shape.'
      )
    )
  )
)
on conflict (kind, slug)
do update set
  status = excluded.status,
  data = excluded.data;

commit;
