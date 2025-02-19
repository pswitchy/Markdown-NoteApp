package com.example.markdownnoteapp;

import com.example.markdownnoteapp.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class MarkdownNoteAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarkdownNoteAppApplication.class, args);
    }

    @Bean
    CommandLineRunner run(UserService userService) {
        return args -> {
            userService.initializeRolesAndAdminUser(); // Call the initialization method on startup
        };
    }
}