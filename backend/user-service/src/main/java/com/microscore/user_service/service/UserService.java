package com.microscore.user_service.service;

import java.util.List;

import com.microscore.user_service.dto.UserRequest;
import com.microscore.user_service.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUserById(Long id);

    List<UserResponse> getAllUsers();

    void deleteUser(Long id);
}
