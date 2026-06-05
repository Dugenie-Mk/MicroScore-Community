# Frontend — MicroScore Community

Application web développée avec **Angular 21** (composants *standalone*) et **Tailwind CSS**.

## Prérequis

- **Node.js 20+** et **npm**
- Le backend démarré (au minimum `discovery-service` + `api-gateway`) pour que les appels API fonctionnent

## Démarrage

```bash
npm install      # uniquement la première fois
npm start        # équivaut à `ng serve`, démarre sur http://localhost:4200
```

Autres commandes utiles :

```bash
npm run build    # build de production (dossier dist/)
npm test         # lance les tests (Vitest)
```

## Structure des fichiers

L'application est organisée par **fonctionnalité** (`features`), avec un noyau technique partagé (`core`) et des éléments réutilisables (`shared`).

```
src/app/
├── core/                  # Code technique global, chargé une seule fois
│   ├── models/            # Interfaces TypeScript (User, ...)
│   ├── services/          # Services qui appellent l'API (HttpClient)
│   ├── guards/            # Protection des routes (ex : utilisateur connecté ?)
│   └── interceptors/      # Ajoute le token JWT à chaque requête HTTP
│
├── shared/                # Éléments réutilisables PARTOUT (sans logique métier)
│   ├── components/        # Boutons, cartes, modales...
│   ├── pipes/
│   └── directives/
│
├── features/              # UNE fonctionnalité = UN dossier (le cœur de l'app)
│   ├── auth/              # Connexion / inscription
│   │   ├── login/
│   │   └── auth.routes.ts
│   └── dashboard/         # Tableau de bord
│
├── layout/                # Ossature visuelle (header, sidebar, footer)
│   └── header/
│
├── app.ts                 # Composant racine
├── app.config.ts          # Providers globaux (router, HttpClient, interceptor)
└── app.routes.ts          # Routes principales (lazy loading par feature)
```

### Rôle de chaque dossier

| Dossier    | Contient                                  | Règle simple                                        |
| ---------- | ----------------------------------------- | --------------------------------------------------- |
| `core`     | Services API, guards, interceptors, modèles | Code technique partagé, chargé une seule fois       |
| `shared`   | Composants / pipes / directives réutilisables | **Sans logique métier**, juste de l'affichage générique |
| `features` | Une page / fonctionnalité par dossier      | Travailler sur les prêts → tout est dans `features/loans` |
| `layout`   | Header, menu, pied de page                 | L'ossature visuelle de l'application                |

## Conventions

- **Composants standalone** (pas de NgModules), avec `imports: [...]` directement dans le composant.
- **Lazy loading** par feature : chaque `*.routes.ts` n'est chargé que lorsqu'on visite la page.
- **Guards et interceptors fonctionnels** (style moderne avec `inject()`).
- Un dossier par composant regroupant les fichiers `.ts`, `.html` et `.css`.

## Connexion au backend

Les services (ex. `core/services/user.service.ts`) appellent des URL relatives comme `/api/users`.
Ces requêtes doivent être redirigées vers l'**api-gateway** (`http://localhost:8888`).

> 💡 Pour le développement, configure un *proxy* Angular afin que `/api` pointe vers la gateway,
> ou définis l'URL complète de la gateway dans les services. (À mettre en place quand on branchera les premières fonctionnalités.)
