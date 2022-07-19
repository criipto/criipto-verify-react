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

  if (result) {
    return (
      <React.Fragment>
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
        {"error" in result ? props.children : null}
      </React.Fragment>
    );
  }
  return props.children;
} 