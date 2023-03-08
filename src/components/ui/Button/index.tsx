import * as React from 'react';
import { Button as AntButton } from 'antd';

type Props = {
  children: React.ReactNode;

  /**
   * If true, render this button in danger mode. Use this for buttons that
   * enable dangerous actions, such as deletion.
   */
  danger?: boolean;

  /**
   * The hyperlink for an anchor button. Only used if the button type is 'link'.
   */
  href?: string;

  /**
   * The HTML button type. Only used if this button is not of type 'link'.
   */
  htmlType?: 'button' | 'submit' | 'reset';

  /**
   * A ReactNode to use as an icon. Works best by choosing icons imported from
   * '@ant-design/icons'
   */
  icon?: React.ReactNode;

  /** Triggered when this button is clicked. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;

  /**
   * The target for an anchor button. Only used if the button type is 'link'.
   */
  target?: string;

  /** The type of button to render. */
  type?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text';
};

/**
 * A Button component. This is a thin wrapper around the And Design Button
 * component.
 */
export function Button(props: Props): JSX.Element {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <AntButton {...props} />;
}
