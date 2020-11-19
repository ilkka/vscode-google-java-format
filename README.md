# google-java-format

This is yet another VS Code extension for running the google-java-format tool as a Java formatter. I could not make any of the others work for me, and I did not want to install an extension that will just run commands from random repositories on save. So, I wrote this, a super simple formatter provider that will just run the google-java-format script from e.g. Homebrew.

It should work as a formatter for only sections of files as well.

## Features

It provides a formatter for the Java language, meaning it runs google-java-format for you.

Install google-java-format from e.g. Homebrew and set it as your Java formatter like:

```json
"[java]": {
  "editor.defaultFormatter": "ilkka.google-java-format",
}
```

## Extension Settings

Use the setting "google-java-format.executable-path" to set the path to the google-java-format executable. The extension does not look in `$PATH` right now.

## Known Issues

Nothing right now.

## Release Notes

### 1.0.2

Stop output window always popping up.

### 1.0.1

Bugfix release to address disappearing changes.

### 1.0.0

Initial release.
