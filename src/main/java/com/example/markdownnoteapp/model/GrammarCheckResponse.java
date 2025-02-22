// java/com/example/markdownnoteapp/model/GrammarCheckResponse.java
package com.example.markdownnoteapp.model;

import lombok.Data;
import java.util.List;

@Data
public class GrammarCheckResponse {
    private List<GrammarMatch> matches;
    
    @Data
    public static class GrammarMatch {
        private String message;
        private List<String> replacements;
        private List<GrammarRule> rule;
    }
    
    @Data
    public static class GrammarRule {
        private String description;
        private Category category;
    }
    
    @Data
    public static class Category {
        private String name;
    }
}