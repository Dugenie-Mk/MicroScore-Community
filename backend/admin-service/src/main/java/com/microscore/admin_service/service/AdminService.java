package com.microscore.admin_service.service;

import com.microscore.admin_service.client.UserClient;
import com.microscore.admin_service.dto.UserCreateDTO;
import com.microscore.admin_service.dto.UserDTO;
import com.microscore.admin_service.entity.AuditLog;
import com.microscore.admin_service.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserClient userClient;
    private final AuditLogRepository auditLogRepository;

    public UserDTO createUser(UserCreateDTO dto, Long adminId) {
        UserDTO created = userClient.createUser(dto);
        saveLog(adminId, "CREATION", "User:" + created.getEmail(), "Création du compte");
        return created;
    }

    public UserDTO validateUser(Long userId, Long adminId) {
        UserDTO validated = userClient.validateUser(userId);
        saveLog(adminId, "VALIDATION", "User:" + userId, "Validation du compte");
        return validated;
    }

    public UserDTO updateUser(Long userId, UserCreateDTO dto, Long adminId) {
        UserDTO updated = userClient.updateUser(userId, dto);
        saveLog(adminId, "MODIFICATION", "User:" + userId, "Modification du compte");
        return updated;
    }

    public void deleteUser(Long userId, Long adminId) {
        userClient.deleteUser(userId);
        saveLog(adminId, "SUPPRESSION", "User:" + userId, "Suppression du compte");
    }

    public List<UserDTO> getAllUsers() {
        return userClient.getAllUsers();
    }

    public UserDTO getUserById(Long id) {
        return userClient.getUserById(id);
    }

    private void saveLog(Long adminId, String action, String cible, String details) {
        auditLogRepository.save(AuditLog.builder()
                .adminId(adminId)
                .action(action)
                .cible(cible)
                .dateAction(LocalDateTime.now())
                .details(details)
                .build());
    }
}