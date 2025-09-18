import type { DocStatus } from "@warehouse/interfaces";
import { DOCSTATUS_CHIP } from "./statusLabels";

  export const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'Draft':
        return '#ffa500';
      case 'Reserved':
        return '#ffa500';
      case 'Shipped':
        return '#ffa500';
      case 'Completed':
        return '#008000';
      case 'Canceled':
        return '#7a7a7a';
      default:
        return '#FF0000';
    }
  };

  export const getIconName = (status: DocStatus) => {
    switch (status) {
      case 'Draft':
        return DOCSTATUS_CHIP['Draft'];
      case 'Reserved':
        return DOCSTATUS_CHIP['Reserved'];
      case 'Shipped':
        return DOCSTATUS_CHIP['Shipped'];
      case 'Completed':
        return DOCSTATUS_CHIP['Completed'];
      case 'Canceled':
        return DOCSTATUS_CHIP['Canceled'];
      default:
        return 'help';
    }
  };
