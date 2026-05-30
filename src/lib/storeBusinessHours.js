const WEEKDAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 0 = Lunes … 6 = Domingo (hora local del navegador). */
export const getMondayBasedDayOfWeek = (date = new Date()) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

export const parseTimeToMinutes = (timeValue) => {
  if (typeof timeValue !== "string") return null;
  const normalized = timeValue.trim().slice(0, 5);
  if (!TIME_REGEX.test(normalized)) return null;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Calcula si el comercio está abierto según horarios HH:mm (hora local del usuario).
 * Los comercios cargan horarios en su hora local; el cliente en la misma región usa la misma.
 */
export const computeStoreAvailability = (schedules = [], referenceDate = new Date()) => {
  const todayIndex = getMondayBasedDayOfWeek(referenceDate);
  const todaySchedule = schedules.find((item) => item.day_of_week === todayIndex);

  if (!todaySchedule || todaySchedule.is_closed) {
    return {
      is_open: false,
      close_time: null,
      open_time: null,
      day_of_week: todayIndex,
    };
  }

  const openMinutes = parseTimeToMinutes(todaySchedule.open_time);
  const closeMinutes = parseTimeToMinutes(todaySchedule.close_time);

  if (
    openMinutes === null ||
    closeMinutes === null ||
    openMinutes >= closeMinutes
  ) {
    return {
      is_open: false,
      close_time: todaySchedule.close_time ?? null,
      open_time: todaySchedule.open_time ?? null,
      day_of_week: todayIndex,
    };
  }

  const nowMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    is_open: isOpen,
    close_time: todaySchedule.close_time ?? null,
    open_time: todaySchedule.open_time ?? null,
    day_of_week: todayIndex,
    day_label: WEEKDAY_LABELS[todayIndex],
  };
};
