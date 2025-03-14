export interface Option {
  text: string;
  value: any;
}

export interface Header {
  id?: string;
  text: string;
  field: string;
  pinneable?: boolean; //ya
  isPinned?: boolean; //ya
  type?: "text" | "number" | "date" | "select" | "checkbox"; //medio
  align?: "left" | "center" | "right"; //ya
  sortable?: boolean; //ya
  readonly?: boolean; //ya
  width?: number; //ya
  prefix?: string; //ya
  suffix?: string; //ya
  options?: Option[];
  searchable?: boolean;
  isHidden?: boolean;

  onChange?: (newValue: any) => void;
}

export type TableItem = Record<string, string | number | null>;
