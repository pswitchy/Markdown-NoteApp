// java/com/example/markdownnoteapp/exception/NoteNotFoundException.java
package com.example.markdownnoteapp.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(String message) {
        super(message);
    }
}