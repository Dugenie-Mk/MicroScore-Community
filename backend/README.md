# Backend — MicroScore Community

Ensemble des micro-services Spring Boot du projet.

## Liste des services

| Service             | Rôle                                          | Port  | Base de données |
| ------------------- | --------------------------------------------- | ----- | --------------- |
| `discovery-service` | Annuaire Eureka (les services s'y enregistrent) | 8761  | —               |
| `api-gateway`       | Point d'entrée unique, route vers les services | 8888  | —               |
| `user-service`      | Gestion des utilisateurs                       | 8085  | MySQL           |
| `loan-service`      | Gestion des prêts                              | 8082  | MySQL           |
| `repayment-service` | Gestion des remboursements                     | 8083  | MySQL           |
| `scoring-service`   | Calcul du score de crédit                      | 8084  | MySQL           |
| `admin-service`     | Administration                                 | 8081  | MySQL           |

## Architecture d'un service métier (en couches)

Chaque service métier suit la même **architecture en couches**. Le `user-service` sert de modèle de référence à reproduire pour les autres.

```
user-service/src/main/java/com/microscore/user_service/
├── UserServiceApplication.java   # Point d'entrée de l'application
├── controller/                   # Couche API : reçoit les requêtes HTTP
├── service/                      # Couche métier : la logique (interface + impl)
├── repository/                   # Couche données : accès MySQL via Spring Data JPA
├── entity/                       # Entités JPA = tables de la base
├── dto/                          # Objets échangés avec le client (entrée / sortie)
├── mapper/                       # Conversion Entity <-> DTO
├── exception/                    # Exceptions perso + gestion centralisée des erreurs
└── config/                       # Configuration (sécurité, beans...)
```

### Le flux d'une requête

```
Client → Controller → Service → Repository → Base de données
                          ↕
                  (DTO ↔ Mapper ↔ Entity)
```

| Couche       | Responsabilité                                | Règle simple                                   |
| ------------ | --------------------------------------------- | ---------------------------------------------- |
| `controller` | Reçoit les requêtes HTTP, renvoie les réponses | Aucune logique métier ; appelle le `service`   |
| `service`    | Logique métier et règles de gestion           | Le « cerveau » du service                      |
| `repository` | Communique avec la base de données            | Interfaces qui étendent `JpaRepository`        |
| `entity`     | Représente une table                          | Annotée `@Entity`                              |
| `dto`        | Données échangées avec le client              | N'expose jamais l'entité directement           |
| `mapper`     | Convertit Entity ↔ DTO                         | Évite de mélanger les deux mondes              |
| `exception`  | Gère les erreurs proprement                    | `@RestControllerAdvice` centralise tout        |
| `config`     | Configuration technique                        | Sécurité, CORS, beans                          |

> Pour créer un nouveau service (ex. `loan-service`), on reproduit cette structure en remplaçant `User` par `Loan`, `Repayment`, etc.

### Exemple d'API exposée par `user-service`

| Méthode | URL              | Description                  |
| ------- | ---------------- | ---------------------------- |
| `POST`  | `/api/users`     | Créer un utilisateur         |
| `GET`   | `/api/users`     | Lister tous les utilisateurs |
| `GET`   | `/api/users/{id}`| Récupérer un utilisateur     |
| `DELETE`| `/api/users/{id}`| Supprimer un utilisateur     |

## Démarrer un service

Chaque service contient le wrapper Maven (`./mvnw`), donc aucune installation de Maven n'est nécessaire.

```bash
cd backend/<nom-du-service>
./mvnw spring-boot:run
```

Pour construire le `.jar` :

```bash
./mvnw clean package
```

### Ordre de démarrage recommandé

1. `discovery-service` (Eureka) — **toujours en premier**
2. `api-gateway`
3. Les services métier (`user-service`, `loan-service`, ...)

Une fois démarrés, les services apparaissent dans le tableau de bord Eureka : http://localhost:8761

## Configuration

La configuration de chaque service se trouve dans `src/main/resources/application.properties` :

- `server.port` : port du service
- `spring.datasource.*` : connexion MySQL (base `boutique` par défaut)
- `eureka.client.service-url.defaultZone` : adresse du discovery-service

> 💡 Pense à créer la base MySQL et à adapter l'utilisateur/mot de passe si besoin avant de lancer les services métier.
