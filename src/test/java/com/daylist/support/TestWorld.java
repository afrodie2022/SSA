package com.daylist.support;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import java.io.IOException;
import java.nio.file.Path;

public final class TestWorld implements AutoCloseable {
    private LocalAppServer server;
    private Playwright playwright;
    private Browser browser;
    private BrowserContext context;
    private Page page;
    private String baseUrl;

    public void start() throws IOException {
        TestConfig config = TestConfig.load();
        baseUrl = config.baseUrl();
        if (baseUrl.isEmpty()) {
            server = new LocalAppServer(Path.of(System.getProperty("app.root", ".")));
            baseUrl = server.baseUrl();
        }
        playwright = Playwright.create();
        BrowserType type = switch (config.browser()) {
            case "firefox" -> playwright.firefox();
            case "webkit" -> playwright.webkit();
            default -> playwright.chromium();
        };
        browser = type.launch(new BrowserType.LaunchOptions().setHeadless(config.headless()));
        context = browser.newContext();
        page = context.newPage();
        page.setDefaultTimeout(10_000);
        page.setDefaultNavigationTimeout(15_000);
    }

    public Page page() {
        return page;
    }

    public String baseUrl() {
        return baseUrl;
    }

    @Override
    public void close() {
        try {
            if (context != null) {
                context.close();
            }
        } finally {
            try {
                if (browser != null) {
                    browser.close();
                }
            } finally {
                try {
                    if (playwright != null) {
                        playwright.close();
                    }
                } finally {
                    if (server != null) {
                        server.close();
                    }
                }
            }
        }
    }
}
