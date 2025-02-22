// java/com/example/markdownnoteapp/entity/Tag.java
package com.example.markdownnoteapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags") // Mapped by 'tags' in Note entity
    private Set<Note> notes = new HashSet<>();

    public Tag(String name) {
        this.name = name;
    }
}