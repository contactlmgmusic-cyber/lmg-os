# Gestion du portail LMG Group

## Mise en service

1. Dans le projet Supabase **LMG OS** (pas Agency), exécuter une seule fois le fichier `supabase/migrations/20260927000100_group_portal.sql` dans SQL Editor, ou appliquer la migration avec votre processus habituel.
2. Ouvrir `/portail-groupe` dans LMG OS avec un compte `admin` ou `super_admin`. La migration importe les deux projets existants et la première actualité, déjà publiés. Un compte sans ces rôles n’a pas accès à l’éditeur.
3. Dans le projet Vercel **lmg-group-portal**, renseigner `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` avec les valeurs publiques du projet LMG OS. Ne jamais utiliser la clé service_role/secrète. Ajouter `PORTAL_CMS_ENABLED=true` après avoir appliqué la migration, puis redéployer le portail.
4. Vérifier une modification de titre, une création de brouillon, sa publication et son retrait. Le portail lit les publications à chaque requête ; une page déjà ouverte doit être rechargée.

Tant que `PORTAL_CMS_ENABLED` n’est pas `true`, le portail affiche ses contenus locaux. Après activation, une panne de la base affiche une erreur temporaire : elle ne remet pas en ligne d’anciens contenus retirés.

## Périmètre et sécurité

- Table `portal_content`, indépendante des artistes, projets internes et contenus du site Music.
- Écriture réservée aux rôles `admin` et `super_admin` par contrôle serveur et RLS. Lecture anonyme limitée au statut `published`.
- Pas de suppression définitive dans l’éditeur : retrait en brouillon. L’adresse d’un contenu est fixe après création, afin de préserver ses liens.
- Les mises à jour concurrentes sont refusées avec un message invitant à recharger la page.
- Bucket `portal-media` : images publiques dès l’import, PNG/JPEG/WebP de 5 Mo maximum. Ne pas y déposer de fichiers confidentiels. Les noms sont aléatoires, pas de remplacement ni de suppression depuis l’éditeur. Les 100 derniers visuels sont réutilisables.
- L’éditeur accepte du texte simple ; aucun HTML n’est interprété. La publication programmée n’est pas proposée.
- Le portail ne reçoit aucune clé secrète et ne se connecte pas avec les comptes des administrateurs.

## Vérifications avant activation

Contrôler avec un visiteur anonyme, un rôle interne non administrateur et un administrateur que : le brouillon n’est pas lisible publiquement ; les non-administrateurs ne peuvent ni modifier les contenus ni importer de médias ; le retrait retire aussi le contenu de l’accueil, de la recherche et du sitemap.

Les tests locaux n’établissent pas l’état des policies déjà présentes sur votre base distante. Les policies PostgreSQL permissives se combinent avec OR : contrôler qu’aucune règle générale existante sur `storage.objects` n’accorde l’écriture au bucket `portal-media` à d’autres rôles.
