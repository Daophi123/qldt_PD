export const toVietnamISO = (date: Date = new Date()): string => {
  return new Date(date.getTime() + 7 * 3600 * 1000).toISOString().replace("Z", "+07:00");
};

  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};
