package com.example.markdownnoteapp.controller;

import com.example.markdownnoteapp.entity.Note;
import com.example.markdownnoteapp.exception.NoteNotFoundException;
import com.example.markdownnoteapp.model.GrammarCheckResponse;
import com.example.markdownnoteapp.service.GrammarCheckService;
import com.example.markdownnoteapp.service.MarkdownService;
import com.example.markdownnoteapp.service.NoteService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Controller
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;
    private final MarkdownService markdownService;
    private final GrammarCheckService grammarCheckService;

    @Autowired
    public NoteController(NoteService noteService, MarkdownService markdownService, GrammarCheckService grammarCheckService) {
        this.noteService = noteService;
        this.markdownService = markdownService;
        this.grammarCheckService = grammarCheckService;
    }

    @GetMapping
    public String listNotes(
            @RequestParam(value = "search", required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Note> notePage = (searchTerm != null && !searchTerm.trim().isEmpty()) 
                ? noteService.searchNotes(searchTerm, pageable)
                : noteService.listNotes(pageable);

        model.addAttribute("notesPage", notePage);
        model.addAttribute("searchTerm", searchTerm);
        return "notes";
    }


    @PostMapping("/save-text")
    public String saveNoteText(
            @RequestParam("title") @NotBlank String title,
            @RequestParam("content") @NotBlank String markdownContent,
            @RequestParam(value = "tags", required = false, defaultValue = "") String tags
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        noteService.saveNote(title, markdownContent, tags, username);
        return "redirect:/notes";
    }

    @PostMapping("/save-file")
    public String saveNoteFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam("title") @NotBlank String title,
            @RequestParam(value = "tags", required = false, defaultValue = "") String tags
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            noteService.saveNoteFromFile(file, title, tags, username);
        } catch (IOException e) {
            return "redirect:/notes?error=fileread";
        }
        return "redirect:/notes";
    }


    @GetMapping("/{id}/html")
    public ResponseEntity<String> getNoteHtml(@PathVariable String id) {
        try {
            String noteContent = noteService.getNoteContent(id);
            return ResponseEntity.ok(markdownService.renderMarkdownToHtml(noteContent));
        } catch (NoteNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/grammar-check")
    public ResponseEntity<GrammarCheckResponse> checkGrammar(@PathVariable String id) {
        try {
            String noteContent = noteService.getNoteContent(id);
            GrammarCheckResponse response = grammarCheckService.checkGrammar(noteContent);
            return response != null 
                    ? ResponseEntity.ok(response) 
                    : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (NoteNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/tags")
    @ResponseBody
    public ResponseEntity<List<String>> getNoteTags(@PathVariable String id) {
        try {
            Note note = noteService.getNoteById(id);
            return ResponseEntity.ok(
                note.getTags() != null 
                    ? List.of(note.getTags().split(",")) 
                    : List.of()
            );
        } catch (NoteNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}