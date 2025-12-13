import { expect, it } from 'vitest';
import { formatDateTime } from '../src/utils/formatDateTime';

it('Форматирование Date в ISO', () => {
    const date = new Date('2022-01-01T00:00:00.000Z');
    const formattedDate = formatDateTime.formatDateToIsoString(date);
    expect(formattedDate).toBe('2022-01-01T03:00:00.000Z');
});
it('Форматирование Date в dd.mm.yyyy', () => {
    const date = new Date('2022-01-01T00:00:00.000Z');
    const formattedDate = formatDateTime.formatDate(date);
    expect(formattedDate).toBe('01.01.2022');
})
it('Форматирование Date в hh:mm', () => {
    const date: Date | undefined = new Date('2022-01-01T00:50:00.000Z');
    formatDateTime.formatDateInTime(date);
    expect(formatDateTime.formatDateInTime(date)).toBe('03:50');
})