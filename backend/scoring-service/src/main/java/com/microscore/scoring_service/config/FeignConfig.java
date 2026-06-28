package com.microscore.scoring_service.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "com.microscore.scoring_service.client")
public class FeignConfig {
}