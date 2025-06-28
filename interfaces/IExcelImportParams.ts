export interface IExcelImportParams {
    fileName: string
    sheetName: string
    tableName?: string
    range?: string
    fieldsName: string[]
}
