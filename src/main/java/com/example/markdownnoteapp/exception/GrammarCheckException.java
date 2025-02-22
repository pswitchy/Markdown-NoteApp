// java/com/example/markdownnoteapp/exception/GrammarCheckException.java
package com.example.markdownnoteapp.exception;

public class GrammarCheckException extends RuntimeException {
    public GrammarCheckException(String message, Throwable cause) {
        super(message, cause);
    }
}