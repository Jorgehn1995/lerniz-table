import type { Header } from "./types";
const items = [
  {
    name: "Ejemplo a",
    a: 1,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo b",
    a: 2,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo c",
    a: 3,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
  {
    name: "Ejemplo",
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
  },
 
];

const headers: Header[] = [
  {
    text: "Nombre",
    field: "name",
    width: 150,
    type: "text",
    modify: false,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "A",
    field: "a",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "B",
    field: "b",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "C",
    field: "c",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "D",
    field: "d",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "E",
    field: "e",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "F",
    field: "f",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "G",
    field: "g",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "A",
    field: "a",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "B",
    field: "b",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "C",
    field: "c",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "D",
    field: "d",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "E",
    field: "e",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "F",
    field: "f",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
  {
    text: "G",
    field: "g",
    width: 80,
    type: "number",
    modify: true,
    searchable: true,
    sortable: true,
    summary: "count",
    prefix: "",
    suffix: "",
    isHidden: false,
  },
];

export { items, headers };
