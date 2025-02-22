// java/com/example/markdownnoteapp/repository/NoteRepository.java
package com.example.markdownnoteapp.repository;

import com.example.markdownnoteapp.entity.Note;
import com.example.markdownnoteapp.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, String> {

    @Query("SELECT n FROM Note n WHERE n.user = :user AND " +
           "(CAST(n.title as string) LIKE CONCAT('%', :searchTerm, '%') OR " +
           "CAST(n.content as string) LIKE CONCAT('%', :searchTerm, '%') OR " +
           "CAST(n.tags as string) LIKE CONCAT('%', :searchTerm, '%'))")
    Page<Note> searchNotesByUser(
        @Param("searchTerm") String searchTerm, 
        @Param("user") User user, 
        Pageable pageable
    );

    Page<Note> findByUser(User user, Pageable pageable);
    
    // Add this security-focused method
    Optional<Note> findByIdAndUser(String id, User user);
}