import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Adjusts the scheduled time to account for the server's UTC timezone
 * when the user inputs time in IST (UTC+5:30).
 * This hook is intended for the `payload-jobs` collection to adjust the `waitUntil` field
 * used for scheduled publishment and unpublishment.
 */
export const adjustScheduleTime: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  // Check if waitUntil is present and has been modified (or newly created)
  if (data.waitUntil && data.waitUntil !== originalDoc?.waitUntil) {
    const originalTime = new Date(data.waitUntil);
    const date = new Date(data.waitUntil);

    // Subtract 5 hours and 30 minutes to convert IST input to actual UTC time
    date.setHours(date.getHours() - 5);
    date.setMinutes(date.getMinutes() - 30);

    //eslint-disable-next-line no-console
    console.log(
      `[Schedule Hook] Original input time: ${originalTime.toISOString()} | Adjusted DB time: ${date.toISOString()}`
    );

    return {
      ...data,
      waitUntil: date.toISOString(),
    };
  }

  return data;
};
