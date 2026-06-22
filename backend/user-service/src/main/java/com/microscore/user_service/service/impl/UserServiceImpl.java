package com.microscore.user_service.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.microscore.user_service.dto.UserRequest;
import com.microscore.user_service.dto.UserResponse;
import com.microscore.user_service.entity.User;
import com.microscore.user_service.exception.ResourceNotFoundException;
import com.microscore.user_service.mapper.UserMapper;
import com.microscore.user_service.repository.UserRepository;
import com.microscore.user_service.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse createUser(UserRequest request) {
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id);
        }
        userRepository.deleteById(id);
    }
}
