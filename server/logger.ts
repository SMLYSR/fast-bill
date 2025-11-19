type LogArgs = Record<string, any>;

function print(level: 'info' | 'error', obj: LogArgs) {
  const base = { level, ts: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ...base, ...obj }));
}

export const logger = {
  info: (obj: LogArgs) => print('info', obj),
  error: (obj: LogArgs) => print('error', obj),
};