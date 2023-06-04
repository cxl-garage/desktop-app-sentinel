import numeral from 'numeral';

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });

export const formatInteger = (num: number): string =>
  numeral(num).format('0,0');
