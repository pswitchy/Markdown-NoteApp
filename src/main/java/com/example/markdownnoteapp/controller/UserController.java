// java/com/example/markdownnoteapp/controller/UserController.java
package com.example.markdownnoteapp.controller;

import com.example.markdownnoteapp.exception.UserAlreadyExistsException;
import com.example.markdownnoteapp.model.RegistrationRequest;
// import com.example.markdownnoteapp.model.MessageResponse;
import com.example.markdownnoteapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registrationRequest", new RegistrationRequest());
        return "register"; // Thymeleaf template name: register.html
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute("registrationRequest") @Valid RegistrationRequest registrationRequest, Model model) {
        try {
            userService.registerNewUser(registrationRequest);
            return "redirect:/login"; // Redirect to login page after successful registration
        } catch (UserAlreadyExistsException e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "register"; // Stay on register page with error message
        }
    }


    @GetMapping("/login")
    public String loginForm() {
        return "login"; // Thymeleaf template name: login.html
    }
}