package com.example.markdownnoteapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class GrammarCheckResponse {
    private List<GrammarCheckResult> matches;
}