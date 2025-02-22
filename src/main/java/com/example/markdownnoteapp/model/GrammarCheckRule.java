// java/com/example/markdownnoteapp/model/GrammarCheckRule.java
package com.example.markdownnoteapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GrammarCheckRule {
    private String id;
    private String description;
    private String issueType;
    private String category;
}