package com.example.markdownnoteapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class GrammarCheckResult {
    private String message;
    private String shortMessage;
    private int offset;
    private int length;
    private List<GrammarCheckRule> rule;
    private List<String> replacements;
    private String context;
}