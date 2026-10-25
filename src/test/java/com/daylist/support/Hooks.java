package com.daylist.support;

import com.microsoft.playwright.Page;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import java.io.IOException;

public final class Hooks {
    private final TestWorld world;

    public Hooks(TestWorld world) {
        this.world = world;
    }

    @Before
    public void start() throws IOException {
        world.start();
    }

    @After
    public void finish(Scenario scenario) {
        try {
            if (scenario.isFailed() && world.page() != null && !world.page().isClosed()) {
                try {
                    scenario.attach(world.page().screenshot(
                            new Page.ScreenshotOptions().setFullPage(true)), "image/png", "Failure");
                } catch (RuntimeException error) {
                    scenario.log("Failure screenshot unavailable: " + error.getMessage());
                }
            }
        } finally {
            world.close();
        }
    }
}
