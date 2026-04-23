export function getTimezoneComparisons(homeTimezone: string, destinationTimezone: string) {
  const anchors = [
    { label: "Morning sync", hour: 9 },
    { label: "Lunch check-in", hour: 13 },
    { label: "Evening handoff", hour: 18 }
  ];

  return anchors.map((anchor) => {
    const date = new Date();
    date.setHours(anchor.hour, 0, 0, 0);

    const home = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: homeTimezone
    }).format(date);

    const destination = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: destinationTimezone
    }).format(date);

    return {
      label: anchor.label,
      home,
      destination
    };
  });
}
