# Java Playwright BDD framework

Java 17 automation using **Playwright for Java, Maven, Cucumber JVM/Gherkin,
and the JUnit Platform suite runner**. No JavaScript/TypeScript test code,
Playwright JS configuration, or Node/npm installation is needed.

The application under test is **Daylist**, the existing dependency-free
HTML/CSS/JavaScript to-do demo (`index.html`, `styles.css`, `app.js`). Its
JavaScript is application code, not automation, and is preserved unchanged.

## Prerequisites and clean-checkout execution

Install JDK 17+ (CI uses Temurin 17) and Maven 3.9+. From the repository root:

```sh
mvn --batch-mode test-compile
mvn --batch-mode exec:java -Dexec.args="install chromium"
mvn --batch-mode verify
```

On Linux, install required system libraries as well (may require sudo):

```sh
mvn --batch-mode exec:java -Dexec.args="install --with-deps chromium"
```

Dependencies and build plugins are pinned in `pom.xml`: Playwright 1.56.0,
Cucumber 7.30.0, and JUnit Platform 1.14.0. Playwright's Java distribution
manages its own driver; do not install npm packages.

## What runs

The `@smoke` feature verifies adding tasks (including literal markup text),
completion and all three filters, remaining counts, and persistence of titles
and completion across reload. Assertions use Playwright auto-waiting, not sleeps.
Each scenario receives its own Playwright instance, browser, context, page,
and loopback server on an OS-assigned free port. Storage is empty at scenario
start but retained during that scenario's reloads.

Cucumber PicoContainer injects scenario-scoped state into hooks and steps.
The `After` hook attempts to attach a full-page PNG on failure, then always
closes resources, including after partial setup failures. Execution is
sequential; there is no shared mutable static browser/page state.

## Layout

```text
pom.xml
src/test/java/com/daylist/
  RunCucumberTest.java         JUnit Platform entry point
  pages/DaylistPage.java       locators, interactions, web assertions
  steps/DaylistSteps.java      Gherkin bindings
  support/                    configuration, Java HTTP server, lifecycle/hooks
src/test/resources/
  features/daylist.feature
  junit-platform.properties   glue, reports, sequential execution
.github/workflows/java-bdd.yml
```

## Configuration

Pass JVM system properties to Maven:

| Property | Default | Meaning |
| --- | --- | --- |
| `baseUrl` | unset | Use the automatic local server; an absolute HTTP(S) URL bypasses it |
| `browser` | `chromium` | `chromium`, `firefox`, or `webkit` |
| `headless` | `true` | `true` or `false` |

```sh
mvn exec:java -Dexec.args="install firefox"
mvn test -Dbrowser=firefox
mvn test -Dheadless=false
mvn test -Dcucumber.filter.tags="@smoke"
mvn test -DbaseUrl=http://127.0.0.1:8000/
```

The external URL must serve the same Daylist application, not a public demo
site. You manage that external server's lifecycle. Normally no separate server
is needed: the Java test-side server automatically serves only the three public
app assets, binds only to `127.0.0.1`, and stops after each scenario. Maven
supplies the repository root to it via `app.root`.

To view the demo manually without running tests, JDK 18+ also offers
`jwebserver -b 127.0.0.1 -p 8000 -d .` from the repository root; stop it with
Ctrl+C. This optional command is not needed on the Java 17 test path.

## Reports and CI

- Cucumber HTML: `target/cucumber-reports/cucumber.html`
- Cucumber JSON (including failure attachments): `target/cucumber-reports/cucumber.json`
- JUnit/Surefire results: `target/surefire-reports/`

Open the HTML report after a run. All reports/build output are ignored by Git;
`mvn clean` removes them. GitHub Actions installs Java 17, Maven dependencies,
Chromium and its Linux system libraries, runs `mvn verify`, and uploads reports
even on failure. It uses no Node-based test commands.

## Troubleshooting

- **Browser executable missing:** rerun the Maven Playwright installation command
  after changing Playwright versions. Its browser binaries are version-specific.
- **Missing Linux libraries:** use `install --with-deps chromium` as above.
- **Headed launch fails:** use headless mode on servers, or provide a display/Xvfb.
- **Download/proxy errors:** Maven Central and Playwright browser download hosts
  must be reachable; configure your organization's Maven/proxy settings.
- **Connection refused with `baseUrl`:** start your external Daylist server and
  verify the URL, or omit the override to use the automatic Java server.
- **No scenarios discovered:** use `mvn test`/`mvn verify` so the suite runner
  and classpath resources are included; do not launch step classes directly.

## Daylist storage

Tasks live only in browser local storage (`daylist.tasks.v1`), scoped to origin;
there is no backend or account. Do not store secrets in this demo. Invalid
stored data produces a warning without overwriting it. Test contexts are
disposable and do not touch your normal browser profile.
