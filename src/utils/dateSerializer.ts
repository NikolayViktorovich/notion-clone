export const serializeDates = <T>(obj: T): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return { __type: 'Date', value: obj.toISOString() };
  if (Array.isArray(obj)) return obj.map(serializeDates);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeDates((obj as any)[key]);
      }
    }
    return result;
  }
  return obj;
};

export const deserializeDates = <T>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  if (obj.__type === 'Date') return new Date(obj.value) as any;
  if (Array.isArray(obj)) return obj.map(deserializeDates) as any;
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deserializeDates(obj[key]);
      }
    }
    return result;
  }
  return obj;
};
