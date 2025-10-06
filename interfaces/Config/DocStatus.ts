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

// Объединяем все статусы
const ALL_DOC_STATUSES = [...DOC_STATUS_IN, ...DOC_STATUS_OUT] as const;

// Типы
type DocStatusIn = typeof DOC_STATUS_IN;
type DocStatusOut = typeof DOC_STATUS_OUT;
type AllDocStatuses = typeof ALL_DOC_STATUSES;

export type DocStatusInName = DocStatusIn[number]['name'];
export type DocStatusOutName = DocStatusOut[number]['name'];
export type DocStatusName = AllDocStatuses[number]['name'];

// Маппинги
export const DocStatusInMap = DOC_STATUS_IN.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusInName, DocStatusIn[number]>);

export const DocStatusOutMap = DOC_STATUS_OUT.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusOutName, DocStatusOut[number]>);

// ✅ Общий маппинг
export const DocStatusMap = ALL_DOC_STATUSES.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocStatusName, AllDocStatuses[number]>);