package com.microscore.user_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI userServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MicroScore - User Service API")
                        .description("Service de gestion des utilisateurs (clients, gestionnaires, administrateurs)")
                        .version("1.0.0"));
    }
}
