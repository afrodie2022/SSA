@smoke
Feature: Daylist task management
  Each scenario starts with a new browser context and empty storage.

  Background:
    Given a fresh Daylist

  Scenario: Add tasks and render user text literally
    When I add the task "Plan the day"
    And I add the task "<b>Read a book</b>"
    Then the visible tasks are:
      | Plan the day         |
      | <b>Read a book</b>    |
    And the remaining count is "2 tasks left"

  Scenario: Complete tasks and switch filters
    When I add the task "Write tests"
    And I add the task "Review changes"
    And I complete the task "Write tests"
    Then the task "Write tests" is completed
    And the remaining count is "1 task left"
    When I select the "Active" filter
    Then the visible tasks are:
      | Review changes |
    When I select the "Completed" filter
    Then the visible tasks are:
      | Write tests |
    When I select the "All tasks" filter
    Then the visible tasks are:
      | Write tests    |
      | Review changes |

  Scenario: Persist task titles and completion across reload
    When I add the task "Keep my progress"
    And I add the task "Next step"
    And I complete the task "Keep my progress"
    And I reload Daylist
    Then the visible tasks are:
      | Keep my progress |
      | Next step        |
    And the task "Keep my progress" is completed
    And the remaining count is "1 task left"
