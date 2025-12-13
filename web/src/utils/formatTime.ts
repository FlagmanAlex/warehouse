export const formatDateInTime = (date: Date | undefined) : string => {
    const hours = date?.getHours().toString().padStart(2, '0') || '00';
    const minutes = date?.getMinutes().toString().padStart(2, '0') || '00';
    return `${hours}:${minutes}`;
};
