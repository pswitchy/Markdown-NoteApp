// java/com/example/markdownnoteapp/repository/TagRepository.java
package com.example.markdownnoteapp.repository;

import com.example.markdownnoteapp.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);
}