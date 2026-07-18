package com.microscore.scoring_service.mapper;

import com.microscore.scoring_service.dto.ScoreDetailResponse;
import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.entity.BlocCritere;
import com.microscore.scoring_service.entity.DetailScore;
import com.microscore.scoring_service.entity.Score;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ScoreMapper {

    private static final Map<String, String> BLOC_LABELS = Map.ofEntries(
            Map.entry("PROFIL_SOCIODEMOGRAPHIQUE", "Profil sociodémographique"),
            Map.entry("CAPACITE_REMBOURSEMENT", "Capacité de remboursement"),
            Map.entry("MONTANT_DUREE", "Montant et durée"),
            Map.entry("HISTORIQUE_CREDIT", "Historique de crédit"),
            Map.entry("ACTIVITE_ECONOMIQUE", "Activité économique"),
            Map.entry("GARANTIES", "Garanties et collatéraux"),
            Map.entry("FACTEURS_COMPORTEMENTAUX", "Facteurs comportementaux")
    );

    private static final List<String> BLOC_ORDER = List.of(
            "PROFIL_SOCIODEMOGRAPHIQUE",
            "CAPACITE_REMBOURSEMENT",
            "MONTANT_DUREE",
            "HISTORIQUE_CREDIT",
            "ACTIVITE_ECONOMIQUE",
            "GARANTIES",
            "FACTEURS_COMPORTEMENTAUX"
    );

    public ScoreResponse toResponse(Score score) {
        return ScoreResponse.builder()
                .scoreId(score.getId())
                .pretId(score.getPretId())
                .clientId(score.getClientId())
                .scoreTotal(score.getScoreTotal())
                .dateCalcul(score.getDateCalcul())
                .build();
    }

    public ScoreDetailResponse toDetailResponse(Score score, List<DetailScore> details) {
        Map<String, List<DetailScore>> grouped = details.stream()
                .collect(Collectors.groupingBy(DetailScore::getBlocCritere));

        List<ScoreDetailResponse.BlocScore> blocs = new ArrayList<>();
        for (String bloc : BLOC_ORDER) {
            List<DetailScore> blocDetails = grouped.get(bloc);
            if (blocDetails == null) continue;

            double totalBloc = blocDetails.stream()
                    .mapToDouble(d -> d.getPoids() != null ? d.getPoids() : 0.0)
                    .sum();
            double scoreBloc = blocDetails.stream()
                    .mapToDouble(d -> d.getPointsObtenus() != null ? d.getPointsObtenus() : 0.0)
                    .sum();

            List<ScoreDetailResponse.CritereScore> criteres = blocDetails.stream()
                    .map(d -> ScoreDetailResponse.CritereScore.builder()
                            .nom(d.getNomCritere())
                            .poids(d.getPoids())
                            .points(d.getPointsObtenus())
                            .build())
                    .toList();

            blocs.add(ScoreDetailResponse.BlocScore.builder()
                    .bloc(bloc)
                    .label(BLOC_LABELS.getOrDefault(bloc, bloc))
                    .totalBloc(totalBloc)
                    .scoreBloc(scoreBloc)
                    .criteres(criteres)
                    .build());
        }

        return ScoreDetailResponse.builder()
                .scoreId(score.getId())
                .pretId(score.getPretId())
                .clientId(score.getClientId())
                .scoreTotal(score.getScoreTotal())
                .dateCalcul(score.getDateCalcul())
                .blocs(blocs)
                .build();
    }
}
