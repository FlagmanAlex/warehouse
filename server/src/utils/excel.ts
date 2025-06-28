import ExcelJS from 'exceljs';
import { IExcelImportParams } from '../../../interfaces/IExcelImportParams';


function colToInt(col: string): number {
    let result = 0;
    for (let i = 0; i < col.length; i++) {
        result *= 26;
        result += col.charCodeAt(i) - 64;
    }
    return result;
}

export const writeExcel = async (data: any[], fileName: string, worksheetName: string) => {
    const workbook = new ExcelJS.Workbook()
    try {
        await workbook.xlsx.readFile(fileName)
    } catch (error) {
        console.log("Файл не найден.");
    }


    const worksheet = workbook.addWorksheet(worksheetName)

    // Добавляем заголовки на основе ключей первого элемента
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map(header => ({
            header: header.charAt(0).toUpperCase() + header.slice(1), // Capitalize first letter
            key: header,
        }));

        // Добавляем данные
        data.forEach(item => {
            worksheet.addRow({ ...item });
        });
    } else {
        console.warn("Массив данных пустой, ничего не записано.");
    }

    await workbook.xlsx.writeFile(fileName)
}

export const readExcelTableToJson = async ({ fileName, sheetName, tableName, fieldsName }: IExcelImportParams): Promise<Record<string, any>[]> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileName);

    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`❌ Лист "${sheetName}" не найден`);

    const table = worksheet.getTable(tableName!) as any | undefined;
    if (!table) throw new Error(`❌ Таблица "${tableName}" не найдена`);

    const rawRef = table.table?.tableRef;
    if (!rawRef || typeof rawRef !== 'string') {
        console.error('⚠️ ref отсутствует. Дамп таблицы:', JSON.stringify(table, null, 2));
        throw new Error(`❌ Таблица "${tableName}" не содержит допустимого ref`);
    }

    const match = rawRef.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`⛔ Неверный формат ref: ${rawRef}`);

    const [, colStart, rowStartStr, colEnd, rowEndStr] = match;
    const rowStart = parseInt(rowStartStr);
    const rowEnd = parseInt(rowEndStr);
    const startColIdx = colToInt(colStart);
    const endColIdx = colToInt(colEnd);

    const headerRow = worksheet.getRow(rowStart);

    if (!Array.isArray(headerRow.values)) {
        throw new Error('❌ Невозможно прочитать заголовки: headerRow.values не массив');
    }

    const headers = headerRow.values.slice(startColIdx, endColIdx + 1) as string[];

    // Фильтрация заголовков по переданным полям
    const filteredHeaders = fieldsName && fieldsName.length > 0
        ? headers.filter(header => fieldsName.includes(header))
        : headers;

    if (filteredHeaders.length === 0) {
        throw new Error('❌ Ни одно из переданных полей не найдено в таблице');
    }

    const result: Record<string, any>[] = [];

    for (let i = rowStart + 1; i <= rowEnd; i++) {
        const row = worksheet.getRow(i);
        const item: Record<string, any> = {};

        filteredHeaders.forEach((header, idx) => {
            const colIndex = headers.indexOf(header) + startColIdx; // Находим индекс столбца
            const cell = row.getCell(colIndex);
            const value = cell.value;

            if (value != null) {
                item[header] = value
            }
        })

        result.push(item);
    }

    return result;
}

export const readExcelRangeToJSon = async ({ fileName, sheetName, fieldsName, range }: IExcelImportParams): Promise<Record<string, any>[]> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileName);

    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`❌ Лист "${sheetName}" не найден`);

    // Проверяем, что диапазон указан корректно
    const match = range!.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`⛔ Неверный формат диапазона: ${range}`);

    const [, colStart, rowStartStr, colEnd, rowEndStr] = match;
    const rowStart = parseInt(rowStartStr);
    const rowEnd = parseInt(rowEndStr);
    const startColIdx = colToInt(colStart);
    const endColIdx = colToInt(colEnd);

    const headerRow = worksheet.getRow(rowStart);

    if (!Array.isArray(headerRow.values)) {
        throw new Error('❌ Невозможно прочитать заголовки: headerRow.values не массив');
    }

    const headers = headerRow.values.slice(startColIdx, endColIdx + 1) as string[];

    // Фильтрация заголовков по переданным полям
    const filteredHeaders = fieldsName && fieldsName.length > 0
        ? headers.filter(header => fieldsName.includes(header))
        : headers;

    if (filteredHeaders.length === 0) {
        throw new Error('❌ Ни одно из переданных полей не найдено в диапазоне');
    }

    const result: Record<string, any>[] = [];

    for (let i = rowStart + 1; i <= rowEnd; i++) {
        const row = worksheet.getRow(i);
        const item: Record<string, any> = {};

        filteredHeaders.forEach((header, idx) => {
            const colIndex = headers.indexOf(header) + startColIdx; // Находим индекс столбца
            const cell = row.getCell(colIndex);
            const value = cell.value;

            if (value != null) {
                item[header] = value;
            }
        });

        result.push(item);
    }

    return result;
};