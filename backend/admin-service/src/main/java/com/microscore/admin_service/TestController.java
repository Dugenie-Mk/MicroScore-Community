package com.microscore.admin_service;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/test")
@RestController
public class TestController {
    
    @RequestMapping("/hello")
    public String hello() {
        return "Hello from Admin Service!";
    }
}
