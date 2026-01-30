package com.musicCommunity.config;

import com.siot.IamportRestClient.IamportClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IamPortConfig {

    @Value("${imp.code}")
    private String impCode;

    @Value("${imp.key}")
    private String impApiKey;

    @Value("${imp.secretKey}")
    private String impSecretKey;

    @Bean
    public IamportClient iamportClient() {
        return new IamportClient(impApiKey, impSecretKey);
    }

}
