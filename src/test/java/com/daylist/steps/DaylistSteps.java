package com.daylist.steps;

import com.daylist.pages.DaylistPage;
import com.daylist.support.TestWorld;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.List;

public final class DaylistSteps {
    private final TestWorld world;

    public DaylistSteps(TestWorld world) {
        this.world = world;
    }

    private DaylistPage daylist() {
        return new DaylistPage(world.page());
    }

    @Given("a fresh Daylist")
    public void freshDaylist() {
        daylist().open(world.baseUrl());
        daylist().assertTasks(List.of());
    }

    @When("I add the task {string}")
    public void addTask(String title) {
        daylist().addTask(title);
    }

    @When("I complete the task {string}")
    public void completeTask(String title) {
        daylist().completeTask(title);
    }

    @When("I select the {string} filter")
    public void filter(String name) {
        daylist().filter(name);
    }

    @When("I reload Daylist")
    public void reload() {
        daylist().reload();
    }

    @Then("the visible tasks are:")
    public void visibleTasks(DataTable table) {
        daylist().assertTasks(table.asList());
    }

    @Then("the remaining count is {string}")
    public void remaining(String text) {
        daylist().assertRemaining(text);
    }

    @Then("the task {string} is completed")
    public void completed(String title) {
        daylist().assertCompleted(title);
    }
}
