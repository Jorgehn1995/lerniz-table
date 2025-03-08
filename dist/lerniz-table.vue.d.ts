import { PropType } from 'vue';
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        'toolbar-top'?(_: {}): any;
        'first-cell'?(_: {}): any;
        columns?(_: {}): any;
        rows?(_: {}): any;
        blank?(_: {}): any;
        'toolbar-bottom'?(_: {}): any;
    };
    refs: {
        boxRef: HTMLDivElement;
        toolbarTopRef: HTMLDivElement;
        tableWrapperRef: HTMLDivElement;
        toolbarBottomRef: HTMLDivElement;
    };
    rootEl: HTMLDivElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<import('vue').ExtractPropTypes<{
    isLoadingTable: BooleanConstructor;
    tableID: {
        type: PropType<string>;
        default: string;
    };
    zoom: {
        type: PropType<number | string>;
        default: number;
    };
    height: {
        type: NumberConstructor;
        default: number;
    };
    showTable: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<{
    isLoadingTable: BooleanConstructor;
    tableID: {
        type: PropType<string>;
        default: string;
    };
    zoom: {
        type: PropType<number | string>;
        default: number;
    };
    height: {
        type: NumberConstructor;
        default: number;
    };
    showTable: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    isLoadingTable: boolean;
    tableID: string;
    zoom: string | number;
    height: number;
    showTable: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {
    boxRef: HTMLDivElement;
    toolbarTopRef: HTMLDivElement;
    tableWrapperRef: HTMLDivElement;
    toolbarBottomRef: HTMLDivElement;
}, HTMLDivElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
