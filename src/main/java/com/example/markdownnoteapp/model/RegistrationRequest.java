package com.example.markdownnoteapp.model;

import jakarta.validation.constraints.NotBlank;

public class RegistrationRequest {
    @NotBlank(message = "Username cannot be blank")
    private String username;
    @NotBlank(message = "Password cannot be blank")
    private String password;

    public RegistrationRequest() {
        // Default constructor
    }

    // Explicit Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}