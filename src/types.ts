export interface Option {
  text: string;
  value: string | number;
}

export interface Header {
  id?: string;
  title: string;
  subtitle?:string;
  field: string;
  pinneable?: boolean; //ya
  isPinned?: boolean; //ya
  type?: "text" | "number" | "date" | "select" | "checkbox"; //ya
  align?: "left" | "center" | "right"; //ya
  sortable?: boolean; //ya
  readonly?: boolean; //ya
  width?: number; //ya
  prefix?: string; //ya
  suffix?: string; //ya
  options?: Option[];
  optionsMap?: Record<string, string>; //ya
}

export type TableItem = Record<string, string | number | null>;
