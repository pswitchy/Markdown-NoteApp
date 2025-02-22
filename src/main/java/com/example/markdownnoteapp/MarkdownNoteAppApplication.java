package com.example.markdownnoteapp;

import com.example.markdownnoteapp.service.NoteService;
import com.example.markdownnoteapp.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MarkdownNoteAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarkdownNoteAppApplication.class, args);
    }

    @Bean
    public CommandLineRunner init(UserService userService, NoteService noteService) {
        return args -> {
            userService.initializeRolesAndAdminUser();
            noteService.reindexAllNotes();
        };
    }
}