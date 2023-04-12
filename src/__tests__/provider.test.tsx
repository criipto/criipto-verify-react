import renderer, {act} from 'react-test-renderer';
import CriiptoVerifyProvider from '../provider';

describe('CriiptoVerifyProvider', () => {
  it('should work in a serverside environment', async () => {
    let component = renderer.create(
      <CriiptoVerifyProvider
        domain="samples.criipto.id"
        clientID="urn:criipto:samples:criipto-verify-react"
        redirectUri="http://localhost:3000"
      >
        <div></div>
      </CriiptoVerifyProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    });
  });
});