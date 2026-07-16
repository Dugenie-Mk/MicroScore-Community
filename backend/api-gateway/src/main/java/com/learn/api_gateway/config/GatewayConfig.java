package com.learn.api_gateway.config;

import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator;
import org.springframework.cloud.gateway.discovery.DiscoveryLocatorProperties;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    DiscoveryClientRouteDefinitionLocator dynamicRoutes(ReactiveDiscoveryClient rdc, DiscoveryLocatorProperties dlp) {
        return new DiscoveryClientRouteDefinitionLocator(rdc, dlp);
    }

    @Bean
    RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/auth/**", "/api/users/**")
                        .uri("lb://user-service"))
                .route("loan-service", r -> r.path("/api/prets/**")
                        .uri("lb://loan-service"))
                .route("repayment-service", r -> r.path("/api/remboursements/**")
                        .uri("lb://repayment-service"))
                .route("scoring-service-params", r -> r.path("/api/blocs-scoring/**", "/api/parametres-scoring/**")
                        .uri("lb://scoring-service"))
                .route("scoring-service-scores", r -> r.path("/api/scores/**")
                        .uri("lb://scoring-service"))
                .build();
    }
}
