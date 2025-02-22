// java/com/example/markdownnoteapp/service/GrammarCheckService.java
package com.example.markdownnoteapp.service;

import com.example.markdownnoteapp.exception.GrammarCheckException;
import com.example.markdownnoteapp.model.GrammarCheckResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
// import org.apache.hc.core5.http.ClassicHttpRequest;
import org.apache.hc.core5.http.HttpEntity;
// import org.apache.hc.core5.http.io.entity.StringEntity;
// import org.apache.hc.core5.net.URIBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
// import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import org.apache.hc.core5.http.NameValuePair;
import org.apache.hc.core5.http.message.BasicNameValuePair;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;


@Service
public class GrammarCheckService {

    @Value("${languagetool.api.url}")
    private String languageToolUrl;

    public GrammarCheckResponse checkGrammar(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new GrammarCheckResponse();
        }

        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(languageToolUrl);
            List<NameValuePair> formParams = new ArrayList<>();
            formParams.add(new BasicNameValuePair("text", text));
            formParams.add(new BasicNameValuePair("language", "en-US"));
            post.setEntity(new UrlEncodedFormEntity(formParams));

            return httpclient.execute(post, response -> {
                int status = response.getCode();
                HttpEntity entity = response.getEntity();
                ObjectMapper mapper = new ObjectMapper();

                if (status >= 200 && status < 300 && entity != null) {
                    return mapper.readValue(entity.getContent(), GrammarCheckResponse.class);
                } else {
                    String errorMessage = "Grammar check failed with status code: " + status;
                    if (entity != null) {
                        errorMessage += ", Response: " + new String(entity.getContent().readAllBytes());
                    }
                    throw new GrammarCheckException(errorMessage, null);
                }
            });
        } catch (IOException e) {
            throw new GrammarCheckException("Error during grammar check API call", e);
        }
    }
}