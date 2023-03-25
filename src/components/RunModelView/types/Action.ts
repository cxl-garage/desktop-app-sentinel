// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Action<T = any> {
  type: T;
}

export interface AnyAction extends Action {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [extraProps: string]: any;
}
