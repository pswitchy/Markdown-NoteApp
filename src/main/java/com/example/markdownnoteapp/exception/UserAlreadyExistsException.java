// java/com/example/markdownnoteapp/exception/UserAlreadyExistsException.java
package com.example.markdownnoteapp.exception;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}