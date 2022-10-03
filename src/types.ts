export enum VariableType {
  VARIABLE = 'variable',
  COMMENT = 'comment',
  NEW_LINE = 'new-line'
}

export interface Variable {
  key?: string;
  value?: string;
  defaultValue: string;
  type: VariableType;
}

export interface Files {
  [filename: string]: Variable[];
}
