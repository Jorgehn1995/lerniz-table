import { defineComponent as M, ref as a, computed as B, watch as J, onMounted as V, onBeforeUnmount as K, createElementBlock as d, openBlock as b, createElementVNode as s, renderSlot as r, normalizeStyle as H, normalizeClass as U } from "vue";
const P = {
  key: 0,
  style: { height: "350px" },
  class: "classBigUniqueTableDFlex classBigUniqueTableJustifyCenter classBigUniqueTableAlignCenter"
}, Z = ["id"], j = { class: "classBigUniqueTableFixedColumn" }, G = {
  key: 1,
  class: "classBigUniqueTableBlankArea classBigUniqueTableDFlex classBigUniqueTableJustifyCenter classBigUniqueTableAlignCenter",
  style: { width: "100%", "background-color": "transparent" }
}, O = /* @__PURE__ */ M({
  __name: "lerniz-table",
  props: {
    isLoadingTable: Boolean,
    tableID: {
      type: String,
      default: "table"
    },
    zoom: {
      type: [Number, String],
      default: 100
    },
    height: {
      type: Number,
      default: 0
    },
    showTable: {
      type: Boolean,
      default: !0
    }
  },
  setup(f) {
    const u = f, w = a(null), k = a(null), q = a(null), n = a(null), R = a(0), C = a(0), x = a(0), A = a(0), S = a(!1), L = a(!1), g = a(!1), h = a(!1), m = a(!1), I = B(() => {
      const e = Number(u.zoom);
      return e < 25 ? 25 : e > 200 ? 200 : e;
    }), _ = B(() => I.value * 0.9 / 100), $ = B(() => u.height === 0 ? R.value - C.value - x.value - A.value : u.height), v = () => {
      var e, t;
      if (!(typeof window > "u")) {
        if (R.value = window.innerHeight, m.value = window.innerWidth < 600, w.value) {
          const l = w.value.getBoundingClientRect();
          C.value = l.top;
        }
        x.value = ((e = k.value) == null ? void 0 : e.offsetHeight) || 0, A.value = ((t = q.value) == null ? void 0 : t.offsetHeight) || 0, document.body.style.overflow = m.value ? "hidden" : "visible";
      }
    }, N = () => {
      if (!n.value) return;
      const { scrollTop: e, scrollLeft: t } = n.value;
      S.value = e > 0, L.value = t > 0, g.value = t > 0, h.value = e > 0;
    }, z = (e) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        return;
      const t = e.target;
      if (!t) return;
      const l = Number(t.getAttribute("data-row")), o = Number(t.getAttribute("data-col"));
      if (isNaN(l) || isNaN(o)) return;
      e.preventDefault();
      const i = Array.from(
        n.value.querySelectorAll("input[data-row][data-col]")
      );
      if (i.length === 0) return;
      const c = Math.max(...i.map((y) => Number(y.getAttribute("data-row")))), E = Math.max(...i.map((y) => Number(y.getAttribute("data-col"))));
      let p = l, T = o;
      switch (e.key) {
        case "ArrowUp":
          p = l === 0 ? c : l - 1;
          break;
        case "ArrowDown":
          p = l === c ? 0 : l + 1;
          break;
        case "ArrowLeft":
          T = o === 0 ? E : o - 1;
          break;
        case "ArrowRight":
          T = o === E ? 0 : o + 1;
          break;
      }
      const D = n.value.querySelector(
        `input[data-row="${p}"][data-col="${T}"]`
      );
      D && D.focus();
    }, W = (e) => {
      const t = n.value;
      if (!t) return;
      const l = e.getBoundingClientRect(), o = t.getBoundingClientRect(), i = 45, c = 80;
      l.left < o.left + i && (t.scrollLeft -= o.left + i - l.left), l.right > o.right && (t.scrollLeft += l.right - o.right), l.top < o.top + c && (t.scrollTop -= o.top + c - l.top), l.bottom > o.bottom && (t.scrollTop += l.bottom - o.bottom);
    }, F = (e) => {
      const t = e.target;
      t && t.tagName === "INPUT" && t.hasAttribute("data-row") && (t.select(), W(t));
    };
    return J(m, () => {
      setTimeout(() => {
        v();
      }, 50);
    }), V(() => {
      var e, t, l;
      typeof window > "u" || (v(), window.addEventListener("resize", v), (e = n.value) == null || e.addEventListener("scroll", N), (t = n.value) == null || t.addEventListener("keydown", z), (l = n.value) == null || l.addEventListener("focusin", F, !0));
    }), K(() => {
      var e, t, l;
      typeof window > "u" || (window.removeEventListener("resize", v), (e = n.value) == null || e.removeEventListener("scroll", N), (t = n.value) == null || t.removeEventListener("keydown", z), (l = n.value) == null || l.removeEventListener("focusin", F, !0));
    }), (e, t) => (b(), d("div", {
      ref_key: "boxRef",
      ref: w,
      class: "theme-lerniz-table classBigUniqueTableDFlex classBigUniqueTableFlexColumn",
      id: "box"
    }, [
      s("div", {
        ref_key: "toolbarTopRef",
        ref: k,
        class: "classBigUniqueTableTollbarTop",
        id: "toolbar-top"
      }, [
        r(e.$slots, "toolbar-top")
      ], 512),
      s("div", {
        ref_key: "tableWrapperRef",
        ref: n,
        class: "classBigUniqueTableTableWrapper align-stretch classBigUniqueTableNiceScroll",
        style: H({ height: $.value + "px" }),
        id: "table"
      }, [
        u.isLoadingTable ? (b(), d("div", P, t[0] || (t[0] = [
          s("div", { class: "classBigUniqueTableSpinner" }, null, -1)
        ]))) : (b(), d("div", {
          key: 1,
          id: u.tableID
        }, [
          f.showTable ? (b(), d("table", {
            key: 0,
            class: U(["classBigUniqueTableFixedTable", { classBigUniqueTableShadowRightCol: L.value }]),
            style: H({ "font-size": _.value + "rem" })
          }, [
            s("thead", {
              class: U(["classBigUniqueTableFixedThead", { classBigUniqueTableShadowUnder: S.value }])
            }, [
              s("tr", null, [
                s("th", {
                  class: U({
                    classBigUniqueTableShadowFirstCellRight: g.value && !h.value,
                    classBigUniqueTableShadowFirstCellBottom: h.value && !g.value,
                    classBigUniqueTableShadowFirstCellAll: h.value && g.value
                  })
                }, [
                  r(e.$slots, "first-cell")
                ], 2),
                r(e.$slots, "columns")
              ])
            ], 2),
            s("tbody", j, [
              r(e.$slots, "rows")
            ])
          ], 6)) : (b(), d("div", G, [
            r(e.$slots, "blank")
          ]))
        ], 8, Z))
      ], 4),
      s("div", {
        ref_key: "toolbarBottomRef",
        ref: q,
        id: "toolbar-bottom"
      }, [
        r(e.$slots, "toolbar-bottom")
      ], 512)
    ], 512));
  }
}), X = {
  install: (f) => {
    f.component("LernizTable", O);
  }
};
export {
  O as LernizTable,
  X as default
};
