/** ******************************
 * Статусы документов для прихода
 * ******************************/
export const DOC_STATUS_ORDER = [
    { nameRus: 'Черновик', name: 'Draft', icon: 'FaPenToSquare', color: 'grey' },
    { nameRus: 'В работе', name: 'InProgress', icon: 'FaRegClock', color: '#ffa500' },
    { nameRus: 'Выполнен', name: 'Completed', icon: 'FaCheck', color: '#008000' },
    { nameRus: 'Отменен', name: 'Canceled', icon: 'FaRegFileExcel', color: 'red' },
] as const;
/** ******************************
 * Статусы документов для прихода
 * ******************************/
export const DOC_STATUS_IN = [
    { nameRus: 'Черновик', name: 'Draft', icon: 'FaPenToSquare', color: 'grey' },
    { nameRus: 'Отгружен', name: 'Shipped', icon: 'FaArrowRight', color: '#ffa500' },
    { nameRus: 'В РЦ', name: 'TransitHub', icon: 'FaRegClock', color: '#ffa500' },
    { nameRus: 'В пути к назначению', name: 'InTransitDestination', icon: 'FaArrowRightToBracket', color: '#ffa500' },
    { nameRus: 'Доставлен', name: 'Delivered', icon: 'FaCheck', color: '#008000' },
    { nameRus: 'Отменен', name: 'Canceled', icon: 'FaRegFileExcel', color: 'red' },
] as const;

/** ******************************
 * Статусы документов для расхода
 ******************************/
export const DOC_STATUS_OUT = [
    { nameRus: 'Черновик', name: 'Draft', icon: 'FaPenToSquare', color: 'grey' },
    { nameRus: 'Резерв', name: 'Reserved', icon: 'FaRegClock', color: '#ffa500' },
    { nameRus: 'Отгружен', name: 'Shipped', icon: 'FaRegFileLines', color: '#ffa500' },
    { nameRus: 'Выполнен', name: 'Completed', icon: 'FaCheck', color: '#008000' },
    { nameRus: 'Отменен', name: 'Canceled', icon: 'FaRegFileExcel', color: 'red' },
] as const;

/** ******************************
 * Статусы документов для перемещения
 ******************************/
export const DOC_STATUS_TRANSFER = [
  { name: 'Draft', nameRus: 'Черновик', icon: 'FaPenToSquare', color: 'grey' },
  { name: 'InTransit', nameRus: 'В пути', icon: 'FaRegClock', color: '#ffa500' },
  { name: 'Received', nameRus: 'Получен', icon: 'FaCheck', color: '#008000' },
  { name: 'Canceled', nameRus: 'Отменен', icon: 'FaRegFileExcel', color: 'red' },
] as const;

// Объединяем все статусы
const ALL_DOC_STATUSES = [...DOC_STATUS_IN, ...DOC_STATUS_OUT, ...DOC_STATUS_TRANSFER, ...DOC_STATUS_ORDER] as const;

// Типы
type DocStatusOrder = typeof DOC_STATUS_ORDER;
type DocStatusIn = typeof DOC_STATUS_IN;
type DocStatusOut = typeof DOC_STATUS_OUT;
type DocStatusTransfer = typeof DOC_STATUS_TRANSFER;
//Общий тип
type AllDocStatuses = typeof ALL_DOC_STATUSES;

// Имена
export type DocStatusOrderName = DocStatusOrder[number]['name'];
export type DocStatusInName = DocStatusIn[number]['name'];
export type DocStatusOutName = DocStatusOut[number]['name'];
export type DocStatusTransferName = DocStatusTransfer[number]['name'];

export type DocStatusName = AllDocStatuses[number]['name'];

// Маппинги
export const DocStatusOrderMap = DOC_STATUS_ORDER.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusOrderName, DocStatusOrder[number]>);   


export const DocStatusInMap = DOC_STATUS_IN.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusInName, DocStatusIn[number]>);

export const DocStatusOutMap = DOC_STATUS_OUT.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusOutName, DocStatusOut[number]>);

export const DocStatusTransferMap = DOC_STATUS_TRANSFER.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusTransferName, DocStatusTransfer[number]>);

// ✅ Общий маппинг
export const DocStatusMap = ALL_DOC_STATUSES.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusName, AllDocStatuses[number]>);

//Status Transactions
// Допустимые переходы между статусами
export const STATUS_TRANSITIONS_OUTGOING: Record<DocStatusOutName, DocStatusOutName[]> = {
  Draft: ['Reserved', 'Canceled'],
  Reserved: ['Shipped', 'Canceled'],
  Shipped: ['Completed', 'Canceled'],
  Completed: [],
  Canceled: [],
};

export const STATUS_TRANSITIONS_INCOMING: Record<DocStatusInName, DocStatusInName[]> = {
  Draft: ['Shipped', 'Canceled'],
  Shipped: ['TransitHub', 'Canceled'],
  TransitHub: ['InTransitDestination', 'Canceled'],
  InTransitDestination: ['Delivered', 'Canceled'],
  Delivered: [],
  Canceled: [],
};

export const STATUS_TRANSITIONS_TRANSFER: Record<DocStatusTransferName, DocStatusTransferName[]> = {
  Draft: ['InTransit', 'Canceled'],
  InTransit: ['Received', 'Canceled'],
  Received: [],
  Canceled: [],
};
export const STATUS_TRANSITIONS_ORDER: Record<DocStatusOrderName, DocStatusOrderName[]> = {
  Draft: ['InProgress', 'Completed', 'Canceled'],
  InProgress: ['Completed', 'Draft', 'Canceled'],
  Completed: ['Draft', 'Canceled'],
  Canceled: ['Draft', 'InProgress'],
};