export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  globalTypes: {
    domain: {
      name: 'Domain',
      description: 'Criipto Verify domain',
      defaultValue: 'samples.criipto.id'
    },
    clientID: {
      name: 'Client ID',
      description: 'Criipto Verify Client ID',
      defaultValue: 'urn:criipto:samples:criipto-verify-react'
    }
  }
}