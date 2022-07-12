# @criipto/verify-react

Accept MitID, NemID, Swedish BankID, Norwegian BankID and more logins in your React app with `@criipto/verify-react`.

## App switch support

`@criipto/verify-react` supports app switching for Swedish BankID and Danish MitID by a best-effort mobile-os detection and setting the relevant Criipto Verify login hints.

## XHR/fetch caveats

The library may require to do fetch requests against Criipto to fetch application configuration. Make sure that the host that the react app runs on is included in the list of callback URLs for your application.

## Criipto

Learn more about Criipto and sign up for your free developer account at [criipto.com](https://www.criipto.com).
