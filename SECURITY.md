# Security Policy

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

To report a vulnerability:

- Use the **"Report a vulnerability"** button on the **Security** tab of
  this repository (GitHub private advisory), or
- Email **babak@cocode.dk**.

We will acknowledge your report within **5 business days** and aim to
release a fix within **30 days** of confirming the vulnerability, depending
on severity and complexity.

## Scope

Night Gallery is a fully self-contained, serverless Tizen TV app: it makes
no network requests and has no backend, so the attack surface is limited to
the packaged content itself (the `.wgt` and the assets/scripts bundled
inside it).

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |
| older   | ❌        |

Only the latest release receives security fixes. Please upgrade to the
latest version before reporting an issue.
