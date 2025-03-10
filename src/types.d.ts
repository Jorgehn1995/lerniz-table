export type Header = {
  text: string;
  field: string;
  type: "text" | "number";
  modify: boolean;
  width: number;
  searchable: boolean;
  sortable: boolean;
  summary: "sum" | "count";
  prefix: string;
  suffix: string;
  isHidden: boolean;
};
