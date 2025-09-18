export const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // месяц от 0 до 11!
  const year = date.getFullYear().toString(); // последние 2 цифры года
  return `${year}-${month}-${day}`;
};