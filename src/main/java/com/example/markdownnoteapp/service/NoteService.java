package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.entity.Note;
import com.example.markdownnoteapp.entity.Tag;
import com.example.markdownnoteapp.entity.User;
import com.example.markdownnoteapp.exception.NoteNotFoundException;
import com.example.markdownnoteapp.repository.NoteRepository;
import com.example.markdownnoteapp.repository.TagRepository;
import com.example.markdownnoteapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
// import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository; // Inject TagRepository

    @Autowired
    public NoteService(NoteRepository noteRepository, UserRepository userRepository, TagRepository tagRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
    }

    public Note saveNote(String title, String markdownContent, List<String> tagNames, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Note note = new Note(title, markdownContent, user);
        setNoteTags(note, tagNames); // Set tags using helper method
        return noteRepository.save(note);
    }

    public Note saveNoteFromFile(MultipartFile file, String title, List<String> tagNames, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        String content = new String(file.getBytes());
        Note note = new Note(title, content, user);
        setNoteTags(note, tagNames); // Set tags using helper method
        return noteRepository.save(note);
    }

    public Note updateNote(String id, String title, String markdownContent, List<String> tagNames, String username) {
        Note note = getNoteById(id);
        note.setTitle(title);
        note.setContent(markdownContent);
        note.getTags().clear(); // Clear existing tags before updating
        setNoteTags(note, tagNames); // Set updated tags
        // Do not update createdAt, but update on every edit if needed:
        // note.setCreatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public Note updateNoteFromFile(String id, MultipartFile file, String title, List<String> tagNames, String username) throws IOException {
        Note note = getNoteById(id);
        note.setTitle(title);
        note.setContent(new String(file.getBytes()));
        note.getTags().clear(); // Clear existing tags before updating
        setNoteTags(note, tagNames); // Set updated tags
        // note.setCreatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    private void setNoteTags(Note note, List<String> tagNames) {
        if (tagNames != null) {
            Set<Tag> tags = tagNames.stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> {
                                Tag newTag = new Tag(tagName);
                                return tagRepository.save(newTag); // Save new tag if not found
                            }))
                    .collect(Collectors.toSet());
            note.getTags().addAll(tags);
        }
    }


    public Page<Note> listNotes(Pageable pageable) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return noteRepository.findByUser(user, pageable);
    }

    public String getNoteContent(String noteId) {
        Note note = getNoteById(noteId);
        return note.getContent();
    }

    public Note getNoteById(String noteId) {
        String username = getCurrentUsername();
        @SuppressWarnings("unused")
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found with id: " + noteId));
    }

    public Page<Note> searchNotes(String searchTerm, Pageable pageable) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return noteRepository.searchNotesByUser(searchTerm, user, pageable);
    }

    public void deleteNote(String noteId) {
        Note note = getNoteById(noteId);
        noteRepository.delete(note);
    }

    public List<String> getNoteTagNames(String noteId) {
        Note note = getNoteById(noteId);
        return note.getTags().stream()
                .map(Tag::getName) // Get tag names
                .collect(Collectors.toList());
    }


    private String getCurrentUsername() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
    }
}