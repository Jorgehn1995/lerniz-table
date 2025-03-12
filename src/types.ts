export interface Option {
  text: string;
  value: any;
}

export interface Header {
  id?:string;
  text: string;
  field: string;
  isPinnedLeft?: boolean;
  isPinnedRight?: boolean;
  type?: "text" | "number";
  modify?: boolean;
  options?: Option[];
  width?: number;
  searchable?: boolean;
  sortable?: boolean;
  summary?: "sum" | "count";
  prefix?: string;
  suffix?: string;
  isHidden?: boolean;
}

export type TableItem = Record<string, string | number | null>;
