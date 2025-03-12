export interface Header {
  text: string;
  field: string;
  type?: "text" | "number";
  modify?: boolean;
  width?: number;
  searchable?: boolean;
  sortable?: boolean;
  summary?: "sum" | "count";
  prefix?: string;
  suffix?: string;
  isHidden?: boolean;
}

export interface TableItem extends Record<string, string | null> {
  name: string;
  a: null;
  b: null;
  c: null;
  d: null;
  e: null;
  f: null;
  g: null;
  h: null;
  i: null;
  j: null;
  k: null;
  l: null;
  m: null;
  n: null;
  o: null;
  p: null;
  q: null;
  r: null;
  s: null;
  t: null;
  u: null;
}
