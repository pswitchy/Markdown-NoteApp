package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.exception.GrammarCheckException;
import com.example.markdownnoteapp.model.GrammarCheckResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpRequest;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.net.URIBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URISyntaxException;

@Service
public class GrammarCheckService {

    @Value("${languagetool.api.url}") // Inject from application.properties
    private String languageToolUrl;

    public GrammarCheckResponse checkGrammar(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new GrammarCheckResponse();
        }

        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            URIBuilder uriBuilder = new URIBuilder(languageToolUrl);
            uriBuilder.addParameter("text", text);
            uriBuilder.addParameter("language", "en-US");

            ClassicHttpRequest request = new HttpPost(uriBuilder.build());
            HttpEntity stringEntity = new StringEntity("");
            ((HttpPost) request).setEntity(stringEntity);

            return httpclient.execute(request, response -> {
                int status = response.getCode();
                HttpEntity entity = response.getEntity();
                ObjectMapper mapper = new ObjectMapper();

                if (status >= 200 && status < 300 && entity != null) {
                    return mapper.readValue(entity.getContent(), GrammarCheckResponse.class);
                } else {
                    String errorMessage = "Grammar check failed with status code: " + status;
                    if (entity != null) {
                        errorMessage += ", Response: " + new String(entity.getContent().readAllBytes()); // Read error response if available
                    }
                    throw new GrammarCheckException(errorMessage, null); // Or handle differently based on status code
                }
            });

        } catch (IOException | URISyntaxException e) {
            throw new GrammarCheckException("Error during grammar check API call", e); // Wrap exceptions into custom exception
        }
    }
}