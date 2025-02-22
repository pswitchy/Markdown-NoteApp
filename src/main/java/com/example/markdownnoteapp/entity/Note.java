package com.example.markdownnoteapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.search.engine.backend.types.Searchable;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor
@Indexed
public class Note {
    @Id
    private String id;

    @FullTextField(analyzer = "english")
    private String title;

    @Lob
    @FullTextField(analyzer = "english")
    private String content;

    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "notes_tags",
        joinColumns = @JoinColumn(name = "note_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @IndexedEmbedded
    private Set<Tag> tags = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    @IndexedEmbedded(includePaths = {"id"})
    private User user;

    @GenericField(searchable = Searchable.YES)
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public Note(String title, String content, User user) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.user = user;
    }
}