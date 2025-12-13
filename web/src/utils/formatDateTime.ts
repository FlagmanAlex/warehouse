export const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // месяц от 0 до 11!
  const year = date.getFullYear().toString(); // последние 2 цифры года
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(value);
};

export class formatDateTime {
  /**
   * Форматирование Date в ISO
   * @param date
   * @returns string
   */
  public static formatDateToIsoString(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // месяц от 0 до 11!
    const year = date.getFullYear().toString(); // последние 2 цифры года
    const hours = date.getHours().toString().padStart(2, "0") || "00";
    const minutes = date.getMinutes().toString().padStart(2, "0") || "00";
    return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
  }
  /**
   * Форматирование Date в hh:mm
   * @param date
   * @returns string
   */
  public static formatDateInTime(date: Date | undefined): string {
    const hours = (date?.getHours().toString().padStart(2, "0") || "00")
    const minutes = date?.getMinutes().toString().padStart(2, "0") || "00";
    return `${hours}:${minutes}`;
  }
  /**
   * Форматирование Date в dd.mm.yyyy
   * @param date
   * @returns string
   */
  public static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // месяц от 0 до 11!
    const year = date.getFullYear().toString(); // последние 2 цифры года
    return `${day}.${month}.${year}`;
  }
  /**
   * Форматирование Date в ms
   * @param date
   * @returns number
   */
  public static formatDateToMs(date: Date): number {
    return date.getTime();
  }

  /**
   * Форматирование Time в текущую дату в Date
   * @param time
   * @returns Date
   */
  public static formatTimeInCurrentDate(time: string | undefined): Date {
    const now = new Date();
    const hours =
      time?.slice(0, 2) || now.getHours().toString().padStart(2, "0");
    const minutes =
      time?.slice(3, 5) || now.getMinutes().toString().padStart(2, "0");
    const res = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now
      .getDate()
      .toString()
      .padStart(2, "0")}T${hours}:${minutes}:00+03:00`;
    const resDate = new Date(res);
    return resDate;
  }
  /**
   * Форматирование Date в UTS
   * @param date
   * @returns
   */
  public static formatDateToUTC(date: Date): string {
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours() - 3,
        date.getUTCMinutes(),
        date.getUTCSeconds()
      )
    );
    return utcDate.toISOString();

    // const day = date.getDate().toString().padStart(2, '0');
    // const month = (date.getMonth() + 1).toString().padStart(2, '0'); // месяц от 0 до 11!
    // const year = date.getFullYear().toString(); // последние 2 цифры года
    // const hours = (date.getHours()-3).toString().padStart(2, '0') || '00';
    // const minutes = date.getMinutes().toString().padStart(2, '0') || '00';
    // const res = `${year}-${month}-${day}T${hours}:${minutes}:00+03:00`;
    // const resDate = new Date(res);
  }
}
