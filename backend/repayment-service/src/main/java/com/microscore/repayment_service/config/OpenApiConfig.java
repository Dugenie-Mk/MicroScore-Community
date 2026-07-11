package com.microscore.repayment_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI repaymentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MicroScore - Repayment Service API")
                        .description("Service de remboursement et grille d'amortissement")
                        .version("1.0.0"));
    }
}