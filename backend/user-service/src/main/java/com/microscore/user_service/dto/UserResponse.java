package com.microscore.user_service.dto;

public record UserResponse(
        Long id,
        String fullName,
        String email
) {
}
