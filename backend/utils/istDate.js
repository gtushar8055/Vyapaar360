// Convert IST boundary to actual UTC Date object
export const getISTStartOfDayUTC = () => {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  ist.setHours(0, 0, 0, 0);

  return new Date(ist.getTime() - 5.5 * 60 * 60 * 1000);
};

export const getISTEndOfDayUTC = () => {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  ist.setHours(23, 59, 59, 999);

  return new Date(ist.getTime() - 5.5 * 60 * 60 * 1000);
};

export const getISTMonthStartUTC = () => {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  ist.setDate(1);
  ist.setHours(0, 0, 0, 0);

  return new Date(ist.getTime() - 5.5 * 60 * 60 * 1000);
};
