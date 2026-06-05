# MicroScore Community

Application de microfinance communautaire avec scoring de crédit basé sur des données alternatives.

## Technologies

| Couche        | Stack                                                        |
| ------------- | ------------------------------------------------------------ |
| Backend       | Java 21+, Spring Boot, Spring Cloud (Eureka + Gateway), JWT  |
| Frontend      | Angular 21, Tailwind CSS                                     |
| Base de données | MySQL                                                      |

## Architecture générale

Le projet est organisé en **micro-services** côté backend et une **application Angular** côté frontend.

```
MicroScore-Community/
├── backend/              # Tous les micro-services Spring Boot
│   ├── discovery-service # Annuaire des services (Eureka)      -> port 8761
│   ├── api-gateway       # Porte d'entrée unique de l'API      -> port 8888
│   ├── user-service      # Gestion des utilisateurs            -> port 8085
│   ├── loan-service      # Gestion des prêts                   -> port 8082
│   ├── repayment-service # Gestion des remboursements          -> port 8083
│   ├── scoring-service   # Calcul du score de crédit           -> port 8084
│   └── admin-service     # Administration                      -> port 8081
├── frontend/
│   └── microscore-frontend  # Application Angular              -> port 4200
├── database/             # Scripts SQL (schéma, données de test)
└── docs/                 # Documentation
```

Le **frontend** parle uniquement à l'**api-gateway**, qui redirige ensuite vers le bon micro-service grâce au **discovery-service** (Eureka).

```
Frontend (4200) ──> api-gateway (8888) ──> user-service / loan-service / ...
                                  └── discovery-service (8761) : trouve les services
```

## Prérequis

- **JDK 21+** (la version exacte est définie dans chaque `pom.xml`)
- **MySQL** en cours d'exécution sur `localhost:3306`
- **Node.js 20+** et **npm**
- Pas besoin d'installer Maven : chaque service contient le wrapper `./mvnw`

## Démarrage du projet

> ⚠️ **L'ordre de démarrage est important.** On démarre toujours `discovery-service` en premier, puis `api-gateway`, puis les services métier, puis le frontend.

### 1. Base de données

Démarrer MySQL et créer la base utilisée par les services :

```sql
CREATE DATABASE boutique;
```

(Les identifiants par défaut sont `root` sans mot de passe, voir `application.properties` de chaque service.)

### 2. Discovery Service (Eureka) — à lancer en premier

```bash
cd backend/discovery-service
./mvnw spring-boot:run
```

Tableau de bord Eureka : http://localhost:8761

### 3. API Gateway

```bash
cd backend/api-gateway
./mvnw spring-boot:run
```

### 4. Les services métier (dans des terminaux séparés)

```bash
cd backend/user-service && mvn spring-boot:run     # port 8085
cd backend/loan-service && mvn spring-boot:run      # port 8082
cd backend/repayment-service && mvn spring-boot:run # port 8083
cd backend/scoring-service && mvn spring-boot:run   # port 8084
cd backend/admin-service && mvn spring-boot:run     # port 8081
```

### 5. Frontend Angular

```bash
cd frontend/microscore-frontend
npm install      # uniquement la première fois
npm start        # démarre sur http://localhost:4200
```

## Documentation détaillée

- Backend : [`backend/README.md`](backend/README.md)
- Frontend : [`frontend/microscore-frontend/README.md`](frontend/microscore-frontend/README.md)

## Équipe

Projet réalisé dans le cadre du projet académique de fin d'année.
