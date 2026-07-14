package com.microscore.admin_service.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLogDTO {
    private Long id;
    private Long adminId;
    private String action;
    private String cible;
    private LocalDateTime dateAction;
    private String details;
}