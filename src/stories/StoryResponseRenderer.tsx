import jwtDecode from 'jwt-decode';
import React from 'react';
import useCriiptoVerify from '../use-criipto-verify';

interface Props {
  children: JSX.Element
}

export default function StoryResponseRenderer(props: Props) : JSX.Element {
  const {result, isLoading} = useCriiptoVerify();

  if (isLoading) {
    return <span>'Loading ...'</span>;
  }

  if (result && "id_token" in result) {
    return (
      <React.Fragment>
        {"state" in result ? <pre>state: {result.state}</pre> : null}
        <pre>
          {JSON.stringify(jwtDecode(result.id_token), null, 2)}
        </pre>
      </React.Fragment>
    );
  }

  if (result) {
    return (
      <React.Fragment>
        {"state" in result ? <pre>state: {result.state}</pre> : null}
        <pre>
          {result instanceof Error ? result.message : JSON.stringify(result, null, 2)}
        </pre>
        {("error" in result || result instanceof Error) ? props.children : null}
      </React.Fragment>
    );
  }
  
  return props.children;
} 