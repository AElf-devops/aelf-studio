export interface IInputItem {
  name: string;
  type: string;
}

export interface IMethod {
  name: string;
  input: IInputItem[];
  fn: any;
  type: 'read' | 'write';
  key?: string | number;
  activeKey?: string | number;
}

export interface ISelectOption {
  value: string;
  label: string;
}
