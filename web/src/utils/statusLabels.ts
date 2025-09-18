import type { DocStatusIn, DocStatusOut, DocType } from "@warehouse/interfaces";
import type { IconName } from "../shared/Icon";

export const DOC_TYPE: Record<DocType, string> = {
    Order: 'Заказ',
    Incoming: 'Приход',
    Outgoing: 'Расход',
    Transfer: 'Перемещение',
    // WriteOff: 'Списание',
    // Return: 'Возврат'
};

export const DOC_STATUS_OUT: Record<DocStatusOut, string> = {
    Draft: 'Черновик',    //Документ создан но не подтвержден. Никаких списаний, ни кол-венных ни финансовых
    Reserved: 'В резерве',   //Документ зарезервирован, Увеличение
    Shipped: 'Отгружен',    //Документ отгружен, но не завершен
    Completed: 'Завершен',    //Документ завершен
    Canceled: 'Отменен'
};
export const DOC_STATUS_IN: Record<DocStatusIn, string> = {
    Draft: 'Черновик',    //Документ создан но не подтвержден. Никаких списаний, ни кол-венных ни финансовых
    Shipped: 'Отгружен',   //Документ отгружен, но не завершен
    InTransitHub: 'В пути на РЦ',
    InTransitDestination: 'В пути к месту назначения',
    Delivered: 'Доставлен',
    Completed: 'Завершен',    //Документ завершен
    Canceled: 'Отменен'
};
export const DOCTYPE_CHIP: Record<DocType, IconName> = {
    Order: 'FaPen',
    Incoming: 'FaArrowRightToBracket',
    Outgoing: 'FaArrowRightFromBracket',
    Transfer: 'FaArrowsLeftRightToLine',
    // WriteOff: 'Fa5',
    // Return: 'Fa6'
};
export const DOCSTATUS_CHIP: Record<DocStatusOut, IconName> = {
    Draft: 'FaPenToSquare',
    Reserved: 'FaRegClock',
    Shipped: 'FaRegFileLines',
    Completed: 'FaCheck',
    Canceled: 'FaRegFileExcel'
};
