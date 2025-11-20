export function formatCurrency(amount: number, type: 'income' | 'expense') {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${Number(amount).toFixed(2)} ¥`;
}

export function formatDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sumBy<T>(rows: T[], pick: (x: T) => number) {
  return rows.reduce((acc, x) => acc + pick(x), 0);
}

export function formatCNDateWithWeek(dateISO: string) {
  const d = new Date(dateISO);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const week = weekMap[d.getDay()];
  return `${month}月${day}日(${week})`;
}

export function formatTime(dateISO: string) {
  const d = new Date(dateISO);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}