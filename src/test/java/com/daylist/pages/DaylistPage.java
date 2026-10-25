package com.daylist.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import java.util.List;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public final class DaylistPage {
    private final Page page;

    public DaylistPage(Page page) {
        this.page = page;
    }

    public void open(String url) {
        page.navigate(url);
        assertThat(page.getByLabel("New task", new Page.GetByLabelOptions().setExact(true))).isVisible();
    }

    public void addTask(String title) {
        page.getByLabel("New task", new Page.GetByLabelOptions().setExact(true)).fill(title);
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Add task")).click();
    }

    public void completeTask(String title) {
        page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions()
                .setName("Mark " + title + " as completed").setExact(true)).click();
        assertCompleted(title);
    }

    public void filter(String name) {
        Locator button = page.getByRole(AriaRole.BUTTON,
                new Page.GetByRoleOptions().setName(name).setExact(true));
        button.click();
        assertThat(button).hasAttribute("aria-pressed", "true");
    }

    public void assertTasks(List<String> titles) {
        assertThat(page.locator("#task-list .task-title")).hasText(titles.toArray(String[]::new));
    }

    public void assertRemaining(String text) {
        assertThat(page.locator("#remaining")).hasText(text);
    }

    public void assertCompleted(String title) {
        assertThat(page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions()
                .setName("Mark " + title + " as active").setExact(true))).isChecked();
    }

    public void reload() {
        page.reload();
    }
}
