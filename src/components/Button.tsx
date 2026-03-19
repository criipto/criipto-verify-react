import React from 'react';
import classNames from 'classnames';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
}
export function AnchorButton(props: AnchorButtonProps) {
  return (
    <a
      className={classNames(`criipto-verify-button`, props.className)}
      href={props.href}
      aria-disabled={props.disabled}
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
      className={classNames(`criipto-verify-button`, props.className)}
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
