// java/com/example/markdownnoteapp/repository/UserRepository.java
package com.example.markdownnoteapp.repository;

import com.example.markdownnoteapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}