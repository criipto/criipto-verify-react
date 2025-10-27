import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    domain: {
      name: 'Domain',
      description: 'Criipto Verify domain',
      defaultValue: 'samples.criipto.io',
    },
    clientID: {
      name: 'Client ID',
      description: 'Criipto Verify Client ID',
      defaultValue: 'urn:criipto:samples:criipto-verify-react',
    },
  },
};

export default preview;
