// react-native-modal-select.d.ts

declare module 'react-native-modal-select' {
  import React from 'react';

  interface Option {
    label: string;
    value: any;
  }

  interface ModalSelectProps {
    data: Option[];
    initValue?: string;
    onSelectedIndexChange?: (index: number) => void;
    onSelectedItemChange?: (item: Option) => void;
    style?: object;
    itemStyle?: object;
    optionContainerStyle?: object;
    optionTextStyle?: object;
    cancelBtnText?: string;
    searchInputPlaceholder?: string;
    showSearchInput?: boolean;
  }

  const ModalSelect: React.ComponentType<ModalSelectProps>;
  namespace ModalSelect {
    function show(options: Option[], callback: (selected: Option) => void): void;
  }

  export default ModalSelect;
}