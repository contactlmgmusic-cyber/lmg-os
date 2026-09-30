UPDATE public.portal_content
SET
  data = jsonb_set(
    jsonb_set(
      data,
      '{intro}',
      to_jsonb(
        'LMG OS est une plateforme de gestion d’entreprise développée initialement pour centraliser les opérations de LMG Group. Projets, tâches, équipes, calendrier, activité, indicateurs et outils internes : l’objectif est de réunir dans un même environnement ce qui est habituellement dispersé entre plusieurs logiciels.'::text
      )
    ),
    '{introEn}',
    to_jsonb(
      'LMG OS is a business management platform initially developed to centralize the operations of LMG Group. Projects, tasks, teams, calendars, activity, performance indicators and internal tools: its purpose is to bring into one environment what is usually spread across multiple platforms.'::text
    )
  )
  ||
  jsonb_build_object(
    'sections',
    jsonb_build_array(

      jsonb_build_object(
        'title', 'Un seul espace pour piloter son activité',
        'text', 'Au quotidien, une entreprise peut rapidement multiplier les outils : un espace pour les projets, un autre pour les tâches, des fichiers ailleurs, un calendrier séparé, des tableaux de suivi et différents canaux de communication.

LMG OS a été conçu autour d’une idée simple : rassembler ces usages dans un environnement unique et structuré.

Depuis un même espace, une équipe peut retrouver ses projets, organiser son travail, suivre ses priorités, consulter son calendrier et accéder aux informations nécessaires à son activité.

L’objectif n’est donc pas d’ajouter un outil supplémentaire, mais de réduire la dispersion de l’information et de donner une vision plus claire de l’entreprise.',
        'titleEn', 'One place to manage your business',
        'textEn', 'Running a business can quickly mean multiplying tools: one platform for projects, another for tasks, files stored elsewhere, a separate calendar, tracking spreadsheets and different communication channels.

LMG OS was designed around a simple idea: bring these uses together in one structured environment.

From a single workspace, a team can access its projects, organize its work, manage priorities, consult its calendar and find the information needed for day-to-day operations.

The goal is not to add another tool, but to reduce fragmented information and provide a clearer view of the organization.'
      ),

      jsonb_build_object(
        'title', 'Une plateforme construite autour de l’entreprise',
        'text', 'LMG OS n’est pas pensé comme un logiciel réservé au secteur musical.

Son architecture repose sur des besoins que l’on retrouve dans de nombreuses organisations : piloter des projets, coordonner une équipe, répartir des responsabilités, suivre l’activité et centraliser l’information.

La plateforme est conçue autour de plusieurs briques de gestion : projets et tâches, calendrier, suivi des équipes et des rôles, indicateurs de performance, documents, notifications et espaces de travail adaptés aux différents utilisateurs.

Selon l’organisation, ces briques permettent de construire un environnement de travail cohérent avec son fonctionnement plutôt que de multiplier les solutions indépendantes.',
        'titleEn', 'A platform built around the business',
        'textEn', 'LMG OS is not designed as software exclusively for the music industry.

Its architecture is based on needs shared by many organizations: managing projects, coordinating teams, assigning responsibilities, monitoring activity and centralizing information.

The platform is built around several management components, including projects and tasks, calendars, team and role management, performance indicators, documents, notifications and workspaces adapted to different users.

Depending on the organization, these components can create a working environment aligned with the way the business operates instead of relying on multiple disconnected solutions.'
      ),

      jsonb_build_object(
        'title', 'Du fonctionnement de LMG à un produit plus large',
        'text', 'LMG OS est né d’un besoin interne.

Avec plusieurs activités, projets, artistes, clients et collaborateurs à coordonner, LMG Group avait besoin d’un système capable de structurer son fonctionnement quotidien et de donner à chacun accès aux bonnes informations.

La plateforme a donc d’abord été développée dans des conditions réelles d’utilisation, directement au sein du groupe.

Cette utilisation interne permet aujourd’hui d’identifier les besoins, d’améliorer les workflows et de faire évoluer progressivement le produit avant son ouverture à d’autres structures.',
        'titleEn', 'From LMG operations to a broader product',
        'textEn', 'LMG OS began as an internal need.

With multiple activities, projects, artists, clients and collaborators to coordinate, LMG Group needed a system capable of structuring day-to-day operations while giving each person access to the right information.

The platform was therefore first developed and used in real operating conditions within the Group itself.

This internal use now makes it possible to identify needs, improve workflows and progressively develop the product before opening it to other organizations.'
      ),

      jsonb_build_object(
        'title', 'Une expérience adaptée à chaque utilisateur',
        'text', 'Centraliser ne signifie pas donner accès à tout à tout le monde.

LMG OS intègre une logique de profils, rôles et permissions permettant d’adapter l’environnement selon les responsabilités de chacun.

Un dirigeant peut avoir besoin d’une vision globale de l’activité, tandis qu’un membre d’équipe doit surtout retrouver ses projets, ses tâches et ses échéances.

L’ambition est que chaque utilisateur dispose d’un espace pertinent pour son travail, tout en conservant une base commune à l’échelle de l’organisation.',
        'titleEn', 'An experience adapted to each user',
        'textEn', 'Centralizing information does not mean giving everyone access to everything.

LMG OS includes profiles, roles and permissions designed to adapt the environment to each user’s responsibilities.

A company leader may need a global view of operations, while a team member primarily needs access to projects, tasks and deadlines.

The objective is to give each user a workspace relevant to their role while maintaining a common operating environment across the organization.'
      ),

      jsonb_build_object(
        'title', 'Une nouvelle étape en développement',
        'text', 'LMG OS continue aujourd’hui d’évoluer au sein de LMG Group.

Le travail en cours vise notamment à transformer cette infrastructure interne en une plateforme capable de s’adapter à des organisations extérieures au groupe, avec une expérience plus configurable et un périmètre fonctionnel progressivement élargi.

Cette version externe est encore en développement et n’est pas commercialisée à ce stade.',
        'titleEn', 'A new stage in development',
        'textEn', 'LMG OS continues to evolve within LMG Group.

Current development is focused on transforming this internal infrastructure into a platform capable of adapting to organizations outside the Group, with a more configurable experience and a progressively expanding range of capabilities.

This external version is still in development and is not commercially available at this stage.'
      ),

      jsonb_build_object(
        'title', 'La suite prochainement',
        'text', 'LMG OS représente une nouvelle étape dans le développement de LMG Group : celle d’un outil conçu à partir de nos propres besoins qui pourrait demain devenir une solution utilisée bien au-delà de notre organisation.

Les fonctionnalités, les usages et les prochaines étapes du produit seront présentés progressivement.

LMG OS — Built inside LMG. Designed to go beyond it.',
        'titleEn', 'More to come',
        'textEn', 'LMG OS represents a new stage in the development of LMG Group: a tool created from our own operational needs that could eventually become a solution used far beyond our organization.

Its capabilities, use cases and next stages of development will be introduced progressively.

LMG OS — Built inside LMG. Designed to go beyond it.'
      )

    )
  ),
  updated_at = now()
WHERE kind = 'news'
  AND slug = 'lmg-os-bientot-au-dela-de-lmg';
