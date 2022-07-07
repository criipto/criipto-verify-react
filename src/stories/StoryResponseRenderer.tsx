import React from 'react';
import useCriiptoVerify from '../use-criipto-verify';

interface Props {
  children: JSX.Element
}

export default function StoryResponseRenderer(props: Props) : JSX.Element {
  const {result} = useCriiptoVerify();
  if (result) {
    return (
      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }
  return props.children;
} 