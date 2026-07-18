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
                .route("admin-service", r -> r.path("/api/admin/**")
                        .uri("lb://admin-service"))
                .route("loan-service", r -> r.path("/api/prets/**", "/api/parametres/**")
                        .uri("lb://loan-service"))
                .route("repayment-service", r -> r.path("/api/remboursements/**")
                        .uri("lb://repayment-service"))
                .route("scoring-service-params", r -> r.path("/api/parametres-scoring/**")
                        .uri("lb://scoring-service"))
                .route("scoring-service-scores", r -> r.path("/api/scores/**")
                        .uri("lb://scoring-service"))
                .route("swagger-user", r -> r.path("/user-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/user-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://user-service"))
                .route("swagger-loan", r -> r.path("/loan-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/loan-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://loan-service"))
                .route("swagger-repayment", r -> r.path("/repayment-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/repayment-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://repayment-service"))
                .route("swagger-scoring", r -> r.path("/scoring-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/scoring-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://scoring-service"))
                .route("swagger-admin", r -> r.path("/admin-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/admin-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://admin-service"))
                .route("swagger-discovery", r -> r.path("/discovery-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/discovery-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://discovery-service"))
                .route("swagger-ui-redirect", r -> r.path("/swagger-ui.html")
                        .filters(f -> f.redirect(302, "/webjars/swagger-ui/index.html"))
                        .uri("no://op"))
                .build();
    }
}
