import { DocStatusIn, DocStatusOut, DocType } from "@interfaces";

export const DOC_TYPE: Record<DocType, string> = {
    Incoming: 'Приход',
    Outgoing: 'Расход',
    Transfer: 'Перемещение',
    WriteOff: 'Списание',
    Return: 'Возврат'
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
    InTransitHub: 'В пути на хабе',
    InTransitDestination: 'В пути к месту назначения',
    Delivered: 'Доставлен',
    Completed: 'Завершен',    //Документ завершен
    Canceled: 'Отменен'
};
export const DOCTYPE_CHIP: Record<DocType, string> = {
    Incoming: 'download',
    Outgoing: 'upload',
    Transfer: 'arrow-swap',
    WriteOff: 'slides',
    Return: 'arrow-return-left'
};
