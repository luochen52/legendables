import h from "snabbdom/h";
import { patch } from "./vdom";
import { VNode } from "snabbdom/vnode";
import { dispatch, Dispatch } from "d3-dispatch";

export interface GradientLegendState {
  type: "gradient";
  index?: number;
  title?: string;
  locked: boolean;
  open: boolean;
  range: Array<string>;
  domain: [number, number];
}

export interface NominalLegendState {
  type: "nominal";
  index?: number;
  title?: string;
  width?: number;
  height?: number;
  open: boolean;
  range: Array<string>;
  domain: Array<string>;
}

export interface StackedLegendState {
  type: "stacked";
  width: number;
  height: number;
  list: Array<GradientLegendState | NominalLegendState>;
}

export type LegendState =
  GradientLegendState
  | NominalLegendState
  | StackedLegendState;

type Handlers = {
  handleFilter: (ev: UIEvent) => void;
};

function renderGradientRowText({ index, domain, range, dispatch }) {
  if (index === 0 || index === range.length - 1) {
    return h("div.text", [
      h("span", domain[index === 0 ? index : 1]),
      h("input", {
        props: {type: 'text', name: 'test', value: domain[index === 0 ? index : 1]},
        on: {
          blur: [(...args) => dispatch.call('blur', null, [...args]), 1, 2, 3]
        }
      })
    ]);
  } else {
    return h("div.text", [h("span", "123")]);
  }
}

export function renderGradientLegend(
  { domain, range }: GradientLegendState,
  dispatch
): VNode {
  return h("div.gradient-legend", [
    h(
      "div",
      range.map((color, index) =>
        h("div.block", [
          h("div.color", { style: { background: color } }),
          renderGradientRowText({ index, domain, range, dispatch })
        ])
      )
    ),
    h("div.lock")
  ]);
}

export function renderNominalLegend(
  state: NominalLegendState,
  updates: Handlers
): VNode {
  return h("div.nominal-legend", [
    h("div.header", "Legend"),
    h(
      "div.body",
      { style: { maxHeight: "100px" } },
      state.domain.map((value, index) =>
        h("div.row", { on: { click: [updates.handleFilter, value] } }, [
          h("div.color", {
            style: { background: state.range[index] }
          }),
          h("div.text", value)
        ])
      )
    )
  ]);
}

export function renderStackedLegend(state, updates): VNode {
  return h("div.legend");
}

export default class Legend {
  node: HTMLElement | VNode;
  dispatch: Dispatch<EventTarget>;

  constructor(node: HTMLElement) {
    this.node = node;
    this.dispatch = dispatch("filter", "change", "blur");
  }

  on(event: string, callback: () => void) {
    this.dispatch.on(event, callback);
  }

  handleFilter = (ev: UIEvent): void => {
    this.dispatch.call("filter", null, ev);
  };

  setState = (state: LegendState): HTMLElement | VNode => {
    if (state.type === "gradient") {
      const vnode = renderGradientLegend(state, this.dispatch);
      this.node = patch(this.node, vnode);
      return this.node;
    } else if (state.type === "nominal") {
      const vnode = renderNominalLegend(state, {
        handleFilter: this.handleFilter
      });
      this.node = patch(this.node, vnode);
      return this.node;
    } else if (state.type === "stacked") {
      const vnode = renderStackedLegend(state, {
        handleFilter: this.handleFilter
      });
      this.node = patch(this.node, vnode);
      return this.node;
    } else {
      throw new Error();
    }
  };
}
