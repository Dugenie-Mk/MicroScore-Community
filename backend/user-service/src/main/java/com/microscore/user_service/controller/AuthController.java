package com.microscore.user_service.controller;

import com.microscore.user_service.auth.LoginRequest;
import com.microscore.user_service.auth.LoginResponse;
import com.microscore.user_service.config.JwtUtil;
import com.microscore.user_service.dto.UserDTO;
import com.microscore.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        UserDTO user = userService.authenticate(request.getEmail(), request.getMotDePasse());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(LoginResponse.builder().token(token).user(user).build());
    }
}
