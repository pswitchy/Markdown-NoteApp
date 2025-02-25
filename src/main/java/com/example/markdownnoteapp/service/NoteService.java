package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.entity.Note;
import com.example.markdownnoteapp.entity.Tag;
import com.example.markdownnoteapp.entity.User;
import com.example.markdownnoteapp.exception.NoteNotFoundException;
import com.example.markdownnoteapp.repository.NoteRepository;
import com.example.markdownnoteapp.repository.TagRepository;
import com.example.markdownnoteapp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.hibernate.Session;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @PersistenceContext
    private EntityManager entityManager;

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
        setNoteTags(note, tagNames);
        return noteRepository.save(note);
    }

    public Note saveNoteFromFile(MultipartFile file, String title, List<String> tagNames, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        String content = new String(file.getBytes());
        Note note = new Note(title, content, user);
        setNoteTags(note, tagNames);
        return noteRepository.save(note);
    }

    public Note updateNote(String id, String title, String markdownContent, List<String> tagNames, String username) {
        Note note = getNoteById(id);
        note.setTitle(title);
        note.setContent(markdownContent);
        note.getTags().clear();
        setNoteTags(note, tagNames);
        return noteRepository.save(note);
    }

    public Note updateNoteFromFile(String id, MultipartFile file, String title, List<String> tagNames, String username) throws IOException {
        Note note = getNoteById(id);
        note.setTitle(title);
        note.setContent(new String(file.getBytes()));
        note.getTags().clear();
        setNoteTags(note, tagNames);
        return noteRepository.save(note);
    }

    private void setNoteTags(Note note, List<String> tagNames) {
        if (tagNames != null) {
            Set<Tag> tags = tagNames.stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> {
                                Tag newTag = new Tag(tagName);
                                return tagRepository.save(newTag);
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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return noteRepository.findByIdAndUser(noteId, user)
                .orElseThrow(() -> new NoteNotFoundException("Note not found with id: " + noteId));
    }

    @Transactional
    public Page<Note> searchNotes(String searchTerm, Pageable pageable) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        SearchSession searchSession = Search.session((Session) entityManager);

        List<Note> results = searchSession.search(Note.class)
                .where(f -> {
                    var boolPredicate = f.bool()
                            .must(f.match().field("userId").matching(user.getId()));
                    
                    if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                        boolPredicate.should(f.match().field("title").matching(searchTerm).fuzzy(2))
                                    .should(f.match().field("content").matching(searchTerm).fuzzy(2));
                    } else {
                        boolPredicate.must(f.matchAll());
                    }
                    
                    return boolPredicate;
                })
                .sort(f -> f.field("createdAt").desc())
                .fetchHits((int) pageable.getOffset(), pageable.getPageSize());

        long totalHits = searchSession.search(Note.class)
                .where(f -> {
                    var boolPredicate = f.bool()
                            .must(f.match().field("userId").matching(user.getId()));
                    
                    if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                        boolPredicate.should(f.match().field("title").matching(searchTerm).fuzzy(2))
                                    .should(f.match().field("content").matching(searchTerm).fuzzy(2));
                    } else {
                        boolPredicate.must(f.matchAll());
                    }
                    
                    return boolPredicate;
                })
                .fetchTotalHitCount();

        return new PageImpl<>(results, pageable, totalHits);
    }

    @Transactional
    public void reindexAllNotes() {
        try {
            Search.session((Session) entityManager).massIndexer(Note.class).startAndWait();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Mass indexing interrupted", e);
        }
    }

    public void deleteNote(String noteId) {
        Note note = getNoteById(noteId);
        noteRepository.delete(note);
    }

    public List<String> getNoteTagNames(String noteId) {
        Note note = getNoteById(noteId);
        return note.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.toList());
    }

    private String getCurrentUsername() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
    }
}