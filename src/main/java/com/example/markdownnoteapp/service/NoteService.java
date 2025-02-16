package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.entity.Note;
import com.example.markdownnoteapp.entity.User;
import com.example.markdownnoteapp.exception.NoteNotFoundException;
import com.example.markdownnoteapp.exception.UnauthorizedAccessException;
import com.example.markdownnoteapp.repository.NoteRepository;
import com.example.markdownnoteapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    public Note saveNote(String title, String markdownContent, String tags, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Note note = new Note(title, markdownContent, tags, user);
        return noteRepository.save(note);
    }

    public Note saveNoteFromFile(MultipartFile file, String title, String tags, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        String content = new String(file.getBytes());
        Note note = new Note(title, content, tags, user);
        return noteRepository.save(note);
    }


    public Page<Note> listNotes(Pageable pageable) {
        User user = getCurrentUser();
        return noteRepository.findByUser(user, pageable);
    }

    public String getNoteContent(String noteId) {
        Note note = getNoteById(noteId);
        return note.getContent();
    }

    public Note getNoteById(String noteId) {
        User user = getCurrentUser();
        Note note = noteRepository.findById(noteId)
            .orElseThrow(() -> new NoteNotFoundException("Note not found with id: " + noteId));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You don't have permission to access this note");
        }
        
        return note;
    }

    public Page<Note> searchNotes(String searchTerm, Pageable pageable) {
        User user = getCurrentUser();
        return noteRepository.searchNotesByUser(searchTerm, user, pageable);
    }

    private User getCurrentUser() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}