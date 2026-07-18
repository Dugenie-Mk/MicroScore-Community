# Formule de calcul du score de crédit

## Principe général

Le score est la somme pondérée de **24 critères** répartis en **7 blocs**. Chaque critère possède un **poids** stocké en base de données (table `parametre_de_scoring`) qui représente le maximum de points qu'il peut rapporter. La somme de tous les poids est égale à **100 %**.

```
ScoreTotal = Σ(points obtenus de chaque critère)
```

Les points obtenus pour chaque critère sont calculés en appliquant une règle métier au poids du critère. Le score final est arrondi à 2 décimales.

---

## Bloc 1 — Profil sociodémographique

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Âge** | `poids` | < 35 ans | `poids / 1.5` |
| | | 35 – 80 ans | `poids` (plein) |
| | | > 80 ans | `poids / 1.25` |
| **Situation matrimoniale** | `poids` | Célibataire | `poids / 1.25` |
| | | Marié / autre | `poids` (plein) |
| **Niveau d'éducation** | `poids` | (toujours) | `poids` (plein) |
| **Stabilité résidentielle** | `poids` | ≥ 60 mois (5 ans) | `poids` (plein) |
| | | ≥ 24 mois (2 ans) | `poids × 0.7` |
| | | < 24 mois | `poids × 0.4` |
| **Personnes à charge** | `poids` | ≤ 2 | `poids` (plein) |
| | | 3 – 4 | `poids × 0.6` |
| | | > 4 | `poids × 0.3` |

---

## Bloc 2 — Capacité de remboursement

Soit :
- `mensualité = montant / durée (en mois)`
- `ratioMensualitéRevenu = mensualité / revenuMensuelNet`
- `ratioChargesRevenu = chargesFixes / revenuMensuelNet`
- `tauxEndettement = (chargesFixes + mensualité) / revenuMensuelNet`

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Revenus mensuels nets** | `poids` | ratioMensualitéRevenu > 0.5 | `poids × 0.5` |
| | | sinon | `poids × (1 − ratioMensualitéRevenu)` |
| **Charges fixes** | `poids` | ratioChargesRevenu > 0.5 | `poids × 0.3` |
| | | 0.3 < ratioChargesRevenu ≤ 0.5 | `poids × 0.6` |
| | | ratioChargesRevenu ≤ 0.3 | `poids` (plein) |
| **Taux d'endettement** | `poids` | tauxEndettement > 0.5 | `poids × 0.3` |
| | | 0.3 ≤ tauxEndettement ≤ 0.5 | `poids × 0.5` |
| | | tauxEndettement < 0.3 | `poids` (plein) |
| **Flux de trésorerie** | `poids` | flux ≤ 0 | `poids × 0.4` |
| | | flux ≥ mensualité × 2 | `poids` (plein) |
| | | flux ≥ mensualité | `poids × 0.7` |
| | | sinon | `poids × 0.3` |

---

## Bloc 3 — Montant et durée du prêt

Soit `ratio = mensualité / revenuMensuelNet` (identique au ratio du bloc 2).

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Montant du prêt** | `poids` | ratio > 0.5 | `poids × 0.5` |
| | | sinon | `poids × (1 − ratio)` |
| **Durée de remboursement** | `poids` | ratio > 0.5 | `poids × 0.5` |
| | | sinon | `poids × (1 − ratio)` |

---

## Bloc 4 — Historique de crédit

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Comportement prêts précédents** (nombre de retards) | `poids` | 0 retard | `poids` (plein) |
| | | 1 – 2 retards | `poids × 0.5` |
| | | > 2 retards | `poids × 0.1` |
| **Nombre de prêts en cours** | `poids` | 0 prêt en cours | `poids` (plein) |
| | | 1 prêt en cours | `poids × 0.6` |
| | | > 1 prêt en cours | `poids × 0.2` |
| **Ancienneté client microfinance** | `poids` | ≥ 36 mois (3 ans) | `poids` (plein) |
| | | 12 – 36 mois | `poids × 0.6` |
| | | < 12 mois | `poids × 0.3` |

---

## Bloc 5 — Activité économique

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Type d'activité** | `poids` | `SALARIÉ` ou `SERVICE` | `poids` (plein) |
| | | `COMMERCE` | `poids × 0.8` |
| | | `ARTISANAT` | `poids × 0.6` |
| | | `AGRICULTURE` | `poids × 0.5` |
| | | Autre / non renseigné | `poids × 0.4` |
| **Ancienneté de l'entreprise** | `poids` | ≥ 36 mois (3 ans) | `poids` (plein) |
| | | 12 – 36 mois | `poids × 0.6` |
| | | < 12 mois | `poids × 0.3` |
| **Chiffre d'affaires mensuel** | `poids` | CA ≥ mensualité × 3 | `poids` (plein) |
| | | CA ≥ mensualité × 1.5 | `poids × 0.6` |
| | | CA < mensualité × 1.5 | `poids × 0.3` |
| | | CA ≤ 0 ou non renseigné | `0` |
| **Secteur d'activité** | `poids` | `FAIBLE_RISQUE` | `poids` (plein) |
| | | `RISQUE_MOYEN` | `poids × 0.6` |
| | | `RISQUE_ELEVE` | `poids × 0.3` |
| | | Non renseigné | `0` |

---

## Bloc 6 — Garanties et collatéraux

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Garantie personnelle** | `poids` | Présente | `poids` (plein) |
| | | Absente | `poids × 0.2` |
| **Garantie matérielle** | `poids` | Présente | `poids` (plein) |
| | | Absente | `poids × 0.2` |
| **Épargne constituée** | `poids` | ratioÉpargne ≥ 30 % du montant | `poids` (plein) |
| | | 10 % ≤ ratioÉpargne < 30 % | `poids × 0.6` |
| | | ratioÉpargne < 10 % | `poids × 0.2` |

---

## Bloc 7 — Facteurs comportementaux

| Critère | Poids max | Condition | Points obtenus |
|---|---|---|---|
| **Motivation / Projet clair** (note d'entretien / 10) | `poids` | Note / 10 × `poids` | `poids × (note ÷ 10)` |
| **Réputation dans la communauté** | `poids` | `EXCELLENT` | `poids` (plein) |
| | | `BON` | `poids × 0.7` |
| | | `MOYEN` | `poids × 0.4` |
| | | `FAIBLE` | `poids × 0.1` |
| **Régularité de l'épargne** | `poids` | `EXCELLENT` | `poids` (plein) |
| | | `BON` | `poids × 0.7` |
| | | `MOYEN` | `poids × 0.4` |
| | | `FAIBLE` | `poids × 0.1` |

---

## Arrondi

Chaque `pointsObtenus` est arrondi à **2 décimales** (`Math.round(v × 100) / 100`).

---

## Implémentation

La formule est implémentée dans la classe :

```
backend/scoring-service/src/main/java/com/microscore/scoring_service/service/ScoringServiceImpl.java
```

Les poids sont chargés depuis la base de données (table `parametre_de_scoring`) via `ParametreDeScoringService.chargerPoidsActifs()` au moment de chaque calcul. Les 24 critères doivent tous être présents et actifs (`actif = true`), sinon une `ScoringConfigurationException` est levée avec le message du critère manquant.
