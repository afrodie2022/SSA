package com.daylist.support;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public final class LocalAppServer implements AutoCloseable {
    private final HttpServer server;

    public LocalAppServer(Path root) throws IOException {
        // Only the three public app assets are served, never arbitrary repository files.
        Map<String, byte[]> assets = Map.of(
                "/", Files.readAllBytes(root.resolve("index.html")),
                "/styles.css", Files.readAllBytes(root.resolve("styles.css")),
                "/app.js", Files.readAllBytes(root.resolve("app.js")));
        Map<String, String> types = Map.of(
                "/", "text/html; charset=utf-8",
                "/styles.css", "text/css; charset=utf-8",
                "/app.js", "text/javascript; charset=utf-8");
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            try {
                String path = exchange.getRequestURI().getPath();
                byte[] body = assets.get(path);
                if (!exchange.getRequestMethod().equals("GET")) {
                    exchange.sendResponseHeaders(405, -1);
                } else if (body == null) {
                    exchange.sendResponseHeaders(404, -1);
                } else {
                    exchange.getResponseHeaders().set("Content-Type", types.get(path));
                    exchange.sendResponseHeaders(200, body.length);
                    exchange.getResponseBody().write(body);
                }
            } finally {
                exchange.close();
            }
        });
        server.start();
    }

    public String baseUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort() + "/";
    }

    @Override
    public void close() {
        server.stop(0);
    }
}
