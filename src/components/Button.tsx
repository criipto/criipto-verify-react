import React from 'react';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
}
export function AnchorButton(props: AnchorButtonProps) {
  return (
    <a
      className={`criipto-verify-button ${props.className}`}
      href={props.href}
      onClick={props.onClick}
    >
      {props.children}
    </a>
  );
}

interface AnchorButtonProps extends ButtonProps {
  href: string;
}
export function Button(props: ButtonProps) {
  return (
    <button
      className={`criipto-verify-button ${props.className}`}
      type="button"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
