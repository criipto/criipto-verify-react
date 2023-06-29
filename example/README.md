# Example app with @criipto-verify-react

`CriiptoVerifyProvider` is implemented in [src/index.js](src/index.js) and the primary app logic is in [src/App.js](src/App.js).
You can run this sample app directly with example credentials, or use your own `domain`and `clientID` if you configure your application on the [Criipto Dashboard](https://dashboard.criipto.com/).

_If using your own credentials, make sure to add the host that the app runs on in the list of callback URLs for your application._  
_If using the default credentials, the app should run on `localhost:3000`._

```jsx
domain = 'samples.criipto.id';
clientID = 'urn:criipto:samples:criipto-verify-react';
```
