// java/com/example/markdownnoteapp/entity/Role.java
package com.example.markdownnoteapp.entity;

import com.example.markdownnoteapp.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRole name;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users;

    public Role(UserRole name) {
        this.name = name;
    }
}