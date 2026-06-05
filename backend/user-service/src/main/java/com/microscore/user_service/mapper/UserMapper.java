package com.microscore.user_service.mapper;

import org.springframework.stereotype.Component;

import com.microscore.user_service.dto.UserRequest;
import com.microscore.user_service.dto.UserResponse;
import com.microscore.user_service.entity.User;

@Component
public class UserMapper {

    public User toEntity(UserRequest request) {
        return User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(request.password())
                .build();
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }
}
