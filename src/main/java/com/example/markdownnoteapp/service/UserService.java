// java/com/example/markdownnoteapp/service/UserService.java
package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.entity.Role;
import com.example.markdownnoteapp.entity.User;
import com.example.markdownnoteapp.enums.UserRole;
import com.example.markdownnoteapp.exception.UserAlreadyExistsException;
import com.example.markdownnoteapp.model.RegistrationRequest;
import com.example.markdownnoteapp.repository.RoleRepository;
import com.example.markdownnoteapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
// import java.util.Optional;
// import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new)) // Fetch roles from User entity
                .build();
    }

    public void registerNewUser(RegistrationRequest registrationRequest) {
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken: " + registrationRequest.getUsername());
        }
        User newUser = new User(registrationRequest.getUsername(), registrationRequest.getPassword());
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // Assign default USER role to new users
        Role userRole = roleRepository.findByName(UserRole.USER)
                .orElseGet(() -> { // Create USER role if it doesn't exist
                    Role role = new Role(UserRole.USER);
                    return roleRepository.save(role);
                });
        newUser.getRoles().add(userRole);

        userRepository.save(newUser);
    }

    public void initializeRolesAndAdminUser() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role(UserRole.ADMIN);
            Role userRole = new Role(UserRole.USER);
            roleRepository.saveAll(List.of(adminRole, userRole));

            if (!userRepository.existsByUsername("admin")) {
                User adminUser = new User("admin", passwordEncoder.encode("admin"));
                adminUser.getRoles().add(adminRole);
                adminUser.getRoles().add(userRole); // Assign both roles
                userRepository.save(adminUser);
            }
        }
    }
}