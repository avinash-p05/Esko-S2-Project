package com.esko.eskos2.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map all requests for assets directly to the static assets folder
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("/WEB-INF/static/assets/");

        // Add a mapping for other static resources if needed
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/WEB-INF/static/");
    }
}