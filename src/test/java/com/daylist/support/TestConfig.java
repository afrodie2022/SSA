package com.daylist.support;

import java.net.URI;
import java.util.Locale;

public record TestConfig(String baseUrl, String browser, boolean headless) {
    public static TestConfig load() {
        String baseUrl = System.getProperty("baseUrl", "").trim();
        if (!baseUrl.isEmpty()) {
            URI uri = URI.create(baseUrl);
            if (!("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))
                    || uri.getHost() == null) {
                throw new IllegalArgumentException("baseUrl must be an absolute HTTP(S) URL");
            }
        }
        String browser = System.getProperty("browser", "chromium").toLowerCase(Locale.ROOT);
        if (!browser.equals("chromium") && !browser.equals("firefox") && !browser.equals("webkit")) {
            throw new IllegalArgumentException("browser must be chromium, firefox, or webkit");
        }
        String headless = System.getProperty("headless", "true");
        if (!headless.equals("true") && !headless.equals("false")) {
            throw new IllegalArgumentException("headless must be true or false");
        }
        return new TestConfig(baseUrl, browser, Boolean.parseBoolean(headless));
    }
}
