export const enumHelper = <T extends Record<string, string>>(
  enumObj: T,
  excludeValue: T[keyof T],
): [string, ...string[]] => {
  const values = Object.values(enumObj).filter(
    (value) => value !== excludeValue,
  );
  return [excludeValue, ...values];
};
