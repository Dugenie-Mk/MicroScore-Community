package com.microscore.scoring_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI scoringServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MicroScore - Scoring Service API")
                        .description("Service de calcul de score de crédit pour MicroScore-Community")
                        .version("1.0.0"));
    }
}