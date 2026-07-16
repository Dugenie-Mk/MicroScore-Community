package com.microscore.admin_service.client;

import com.microscore.admin_service.dto.UserDTO;
import com.microscore.admin_service.dto.UserCreateDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "user-service")
public interface UserClient {

    @PostMapping("/api/users")
    UserDTO createUser(@RequestBody UserCreateDTO dto);

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable Long id);

    @GetMapping("/api/users")
    List<UserDTO> getAllUsers();

    @PutMapping("/api/users/{id}")
    UserDTO updateUser(@PathVariable Long id, @RequestBody UserCreateDTO dto);

    @DeleteMapping("/api/users/{id}")
    void deleteUser(@PathVariable Long id);

    @PutMapping("/api/users/{id}/validate")
    UserDTO validateUser(@PathVariable Long id);
}