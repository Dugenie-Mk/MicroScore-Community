package com.microscore.admin_service.controller;

import com.microscore.admin_service.dto.UserCreateDTO;
import com.microscore.admin_service.dto.UserDTO;
import com.microscore.admin_service.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(
            @Valid @RequestBody UserCreateDTO dto,
            @RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createUser(dto, adminId));
    }

    @PutMapping("/users/{id}/validate")
    public ResponseEntity<UserDTO> validateUser(
            @PathVariable Long id,
            @RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(adminService.validateUser(id, adminId));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserCreateDTO dto,
            @RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(adminService.updateUser(id, dto, adminId));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @RequestHeader("X-Admin-Id") Long adminId) {
        adminService.deleteUser(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }
}