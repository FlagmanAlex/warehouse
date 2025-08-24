export interface IAuditLog {
    _id?: string;                             // Уникальный идентификатор записи аудита
    entity: AuditLogEntity;                 // Сущность, к которой относится запись аудита
    entityId: string;                       // Идентификатор сущности
    action: AuditLogAction;                 // Описание действия
    userId: string;                         // Идентификатор пользователя, который выполнил действие
    changedFields: AuditLogChangeFields;    // Измененные поля
    timestamp: Date;                        // Дата и время действия
}

export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
export type AuditLogEntity = 'ORDER' | 'WAREHOUSE' | 'SUPPLIER' | 'USER' | 'PRODUCT' | 'DOCUMENT' | 'TRANSACTION';

type AuditLogChangeFields = {
    [key: string]: { oldValue: any; newValue: any; }
}