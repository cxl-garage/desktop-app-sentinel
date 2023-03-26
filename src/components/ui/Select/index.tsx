import * as React from 'react';
import { Select as AntSelect } from 'antd';

export type OptionType<T> = {
  label: React.ReactNode;
  value?: T;
  children?: Array<Omit<OptionType<T>, 'children'>>;
};

type Props<T> = {
  placeholder?: string;
  options: ReadonlyArray<OptionType<T>>;
  defaultValue?: T;
  value?: T;
  onChange: (
    value: T,
    option: OptionType<T> | ReadonlyArray<OptionType<T>>,
  ) => void;
};

export function Select<T extends string | number>({
  placeholder,
  options,
  defaultValue,
  value,
  onChange,
}: Props<T>): JSX.Element {
  return (
    <AntSelect
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      options={options as Array<OptionType<T>>}
      onChange={onChange}
    />
  );
}
