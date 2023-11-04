export function getFullDate(date: string): string {
  const newDate = new Date(date);
  return (
    newDate.getMonth() +
    1 +
    '/' +
    newDate.getDate() +
    '/' +
    newDate.getFullYear()
  );
}

export function getLocaleTimeString(date: string): string {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
