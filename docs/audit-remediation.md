# Consolidation LMG Music — 6 octobre 2026

## Déploiement coordonné

Cette branche contient des corrections de code et une migration. Elle n'a pas modifié Supabase ou Vercel de production. Appliquer la migration avant de déployer les routes qui l'utilisent.

1. Sauvegarder la base réelle. Exporter son schéma avec Supabase CLI (`supabase db dump --linked --file supabase/baseline-reviewed.sql`) dans un environnement autorisé. Relire cet export : les migrations du dépôt ne constituent pas un baseline complet. Ne pas inventer une base initiale à partir des seules colonnes utilisées par l'interface.
2. Vérifier les contraintes et triggers existants de `profiles`, `invitations`, `careers_applications` et `storage.objects` avec le SQL en lecture seule fourni. Tester la migration sur un clone représentatif.
3. Appliquer `supabase/migrations/20261006000100_audit_security.sql` à la base LMG OS. Elle ferme les écritures publiques Careers, ajoute un quota atomique et la réservation/finalisation des invitations, puis remet en brouillon uniquement l'offre test identifiée.
4. Configurer les variables serveur Vercel ci-dessous, avec les informations exactes de l'exploitant. Elles ne doivent pas avoir de préfixe `NEXT_PUBLIC_`.
5. Déployer la branche en preview, effectuer la recette par rôle puis déployer en production. La maintenance du site public reste pilotée par son réglage existant.
6. Autoriser `https://os.lmgmusic.fr/auth/callback` dans les URLs de redirection Supabase Auth, vérifier les emails de récupération et le flux PKCE sur le même navigateur.

| Variable | Usage |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Routes serveur Careers et invitations uniquement ; clé existante à vérifier. |
| `CAREERS_CONTROLLER_NAME` | Nom légal réel de l'exploitant. |
| `CAREERS_CONTROLLER_ADDRESS` | Adresse légale réelle. |
| `CAREERS_CONTROLLER_REGISTRATION` | Identification d'immatriculation réelle, le cas échéant. |
| `CAREERS_PRIVACY_EMAIL` | Adresse opérationnelle pour les demandes relatives aux candidatures. |
| `CAREERS_RATE_LIMIT_SECRET` | Secret aléatoire serveur pour hacher l'adresse IP utilisée par le quota. Générer localement, ne pas partager dans un message. |

Les envois de candidatures sont fermés si l'identité, le secret de quota ou l'adresse client fiable ne sont pas configurés. Le code fait confiance à `x-real-ip` fourni par Vercel ; sur un autre hébergeur, le proxy doit écraser cet en-tête. Le quota conserve des hashes pendant au plus quelques heures et limite à cinq tentatives par IP/heure et cent tentatives globales/heure. Les téléchargements de CV restent privés.

Les CV sont limités à 4 Mo (formulaires, serveur et stockage), pour garder le multipart sous la limite de payload Vercel de 4,5 Mo. Source : https://vercel.com/docs/functions/limitations.

La validation des fichiers vérifie taille, extension, MIME et signature. Elle ne remplace pas un antivirus ; DOCX est identifié comme une archive ZIP et non analysé entièrement. Ne pas ouvrir de documents non fiables avec macros activées. Une panne de compensation est journalisée et doit être traitée par l'administration.

## Recette requise en préproduction

- Admin et super_admin : calendrier mensuel/global présentent les mêmes sources ; les dates artistes, contrats, sorties, relances et Release Planner apparaissent avec une fixture contenant chaque type.
- Manager, direction artistique, artiste A, artiste B et prestataire : lecture conforme au périmètre prévu ; tentative d'accès direct à une fiche hors périmètre refusée côté base. Aucun élargissement de visibilité ne doit être déduit du menu.
- Careers : refus d'écriture directe anon/authenticated ; envoi serveur autorisé avec vrai CV de test ; dépassement de quota ; faux PDF ; offre expirée ; insertion en panne suivie d'un nettoyage du CV. Aucun test de charge sur la production.
- Invitations : double acceptation simultanée ; erreur de profil ; erreur Auth ; invitation expirée ; le rôle direction artistique est disponible. Une invitation réservée après un crash n'est pas reprise automatiquement : vérifier l'absence de compte créé avant de libérer `claim_id`.
- Connexion : retour selon rôle, mauvais identifiant, mot de passe oublié, lien expiré et changement de mot de passe depuis le lien reçu.
- Analytics : contexte navigateur vierge, aucun chargement gtag avant accord ; refus sans mesure ; accord avec une seule initialisation ; retrait désactivant Analytics et recharge du document.
- Site : maintenance 503 et Retry-After ; domaines/URLs corrects dans robots et sitemap ; métadonnées Music/Careers/Artist ; pas d'indexation OS ou preview ; liens interdomaines.
- Mobile/clavier : consentement, connexion, candidature et pages publiques ; mesurer les performances avec les données et images réelles.
- Intégrations : Google OAuth/Drive/Calendar, Spotify, YouTube, secrets cron et trois exécutions planifiées ; vérifier les journaux et restaurer une sauvegarde de test.

## État des points d'audit

| Points | État dans la branche |
|---|---|
| 01 | Next.js 16.3.8, Moment à jour, dépendances obsolètes inutilisées retirées. Audit runtime : zéro alerte lors du contrôle. Cinq alertes élevées subsistent dans l'outillage ESLint, liées à braces/micromatch/fast-glob, sans correctif compatible publié ; pas de downgrade Next 14 forcé. |
| 02 | Chargement global Analytics retiré ; consentement et retrait centralisés. |
| 03, 12–14 | Route serveur, validation, quota persistant, retrait des écritures directes et nettoyage serveur. Migration/configuration à appliquer. |
| 04 | Notice configurable et collecte fermée tant que l'entité/contact ne sont pas renseignés. Informations exactes encore attendues. |
| 05, 08, 15–16, 20 | Métadonnées/domaines, sitemap, lien Artists, matcher, protection serveur OS, maintenance et langue initiale Careers corrigés. FR/EN reste un choix côté client, sans prétendre à deux URLs indexables. |
| 06, 25 | Réservation/finalisation atomique d'invitation et rôle direction artistique ; migration requise. |
| 07 | ESLint flat natif, typecheck, tests et CI opérationnels. Diagnostics d'optimisation React Compiler en avertissements car le compilateur n'est pas activé ; règles d'ordre des hooks actives. Le lint garde visibles les avertissements anciens. |
| 09–11 | Agrégateur commun, erreurs partielles visibles, dates métier Europe/Paris et titre du mois sélectionné corrigés. Recette avec base réelle requise. |
| 17 | Connexion améliorée et parcours de récupération ajouté ; URL Auth et email à vérifier en production. |
| 18–19 | Procédure de baseline/restauration et SQL d'inspection fournis ; schéma réel et policies de production non accessibles, donc non certifiés. |
| 21–24 | Images allégées, headers de sécurité, code obsolète retiré, permission assistant alignée sur super_admin. CSP limitée au framing/objets/base pour préserver les intégrations ; pas de CSP stricte script sans recette dédiée. |
| 26 | Migration ciblée pour dépublier l'offre test ; action production non effectuée. |
| Portail artiste | Page de présentation conservée, exemples signalés, accès à l'espace web OS ajouté ; promesse Face ID remplacée par le statut réel de l'app. Application mobile hors de ce dépôt. |

Aucune validation de production, sauvegarde, MFA ou application mobile n'est revendiquée. La comparaison avec le schéma réel reste indispensable avant application de la migration.

## Vérifications de la branche

- Tests Node : 12 scénarios, dont migration exécutée sur PostgreSQL embarqué (PGlite), quotas, retrait des accès anonymes, réservation d’invitation, rollback, formats CV, corps de requête borné, dates Paris et routage des domaines.
- Lint : 0 erreur ; avertissements historiques conservés et visibles.
- Build : compilation et TypeScript validés avec variables publiques fictives de test, sans secret de production ; cela ne valide pas les intégrations réelles.
- Audit des dépendances de production : 0 alerte lors du contrôle.
- Les six images optimisées passent au total d’environ 8,9 Mo à 1,45 Mo (mêmes fichiers et transparence des logos conservée).

## Informations provisoires confirmées le 6 octobre

LMG Music — société en cours de création ; adresse de contact : 138 avenue Victor-Hugo, 75016 Paris, France ; téléphone : 06 15 95 33 74 ; candidatures/confidentialité : candidature@lmgmusic.fr. Aucun numéro d’immatriculation n’est inventé. Ces valeurs servent de valeurs par défaut, remplaçables par les variables serveur existantes et `CAREERS_PRIVACY_PHONE`.

La publication du code ne réalise pas la migration Supabase. Sans les fonctions SQL, les nouvelles acceptations d’invitations répondent 503 avant de créer un compte. Les comptes existants restent utilisables. Les formulaires de candidature restent fermés jusqu’à configuration du secret, de la clé serveur et de `CAREERS_SUBMISSIONS_ENABLED=true`, à activer uniquement après migration et recette.
