import { defineComponent as H, ref as o, computed as v, onMounted as E, onBeforeUnmount as $, createElementBlock as r, openBlock as i, createElementVNode as t, renderSlot as a, normalizeStyle as B, normalizeClass as b } from "vue";
const x = {
  key: 0,
  class: "loading"
}, N = ["id"], F = { class: "fixed-column" }, D = {
  key: 1,
  class: "blank"
}, I = /* @__PURE__ */ H({
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
  setup(u) {
    const s = u, f = o(null), m = o(null), p = o(null), n = o(null), w = o(0), g = o(0), y = o(0), z = o(0), T = o(!1), k = o(!1), c = o(!1), d = o(!1), S = v(() => {
      const e = Number(s.zoom);
      return e < 25 ? 25 : e > 200 ? 200 : e;
    }), _ = v(() => S.value * 0.9 / 100), L = v(() => s.height == 0 ? w.value - g.value - y.value - z.value : s.height), h = () => {
      var e, l;
      if (w.value = window.innerHeight, f.value) {
        const C = f.value.getBoundingClientRect();
        g.value = C.top;
      }
      y.value = ((e = m.value) == null ? void 0 : e.offsetHeight) || 0, z.value = ((l = p.value) == null ? void 0 : l.offsetHeight) || 0;
    }, R = () => {
      if (!n.value) return;
      const { scrollTop: e, scrollLeft: l } = n.value;
      T.value = e > 0, k.value = l > 0, c.value = l > 0, d.value = e > 0;
    };
    return E(() => {
      var e;
      h(), window.addEventListener("resize", h), (e = n.value) == null || e.addEventListener("scroll", R);
    }), $(() => {
      var e;
      window.removeEventListener("resize", h), (e = n.value) == null || e.removeEventListener("scroll", R);
    }), (e, l) => (i(), r("div", {
      ref_key: "boxRef",
      ref: f,
      class: "container"
    }, [
      t("div", {
        ref_key: "toolbarTopRef",
        ref: m,
        class: "toolbar"
      }, [
        a(e.$slots, "toolbar-top")
      ], 512),
      t("div", {
        ref_key: "tableWrapperRef",
        ref: n,
        class: "table-wrapper",
        style: B({ height: L.value + "px" })
      }, [
        s.isLoadingTable ? (i(), r("div", x, " Cargando... ")) : (i(), r("div", {
          key: 1,
          id: s.tableID
        }, [
          u.showTable ? (i(), r("table", {
            key: 0,
            class: b(["fixed-table", { "shadow-right-col": k.value }]),
            style: B({ "font-size": _.value + "rem" })
          }, [
            t("thead", {
              class: b(["fixed-thead", { "shadow-under": T.value }])
            }, [
              t("tr", null, [
                t("th", {
                  class: b({
                    "shadow-first-cell-right": c.value && !d.value,
                    "shadow-first-cell-bottom": d.value && !c.value,
                    "shadow-first-cell-all": d.value && c.value
                  })
                }, [
                  a(e.$slots, "first-cell")
                ], 2),
                a(e.$slots, "columns")
              ])
            ], 2),
            t("tbody", F, [
              a(e.$slots, "rows")
            ])
          ], 6)) : (i(), r("div", D, [
            a(e.$slots, "blank")
          ]))
        ], 8, N))
      ], 4),
      t("div", {
        ref_key: "toolbarBottomRef",
        ref: p,
        class: "toolbar"
      }, [
        a(e.$slots, "toolbar-bottom")
      ], 512)
    ], 512));
  }
}), M = {
  install: (u) => {
    u.component("LernizTable", I);
  }
};
export {
  I as LernizTable,
  M as default
};
