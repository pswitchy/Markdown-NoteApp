// java/com/example/markdownnoteapp/repository/RoleRepository.java
package com.example.markdownnoteapp.repository;

import com.example.markdownnoteapp.entity.Role;
import com.example.markdownnoteapp.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(UserRole name);
}