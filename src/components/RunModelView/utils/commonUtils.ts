import numeral from 'numeral';

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });

// Format an number as a integer with the US decimal notation, e.g. 1234567 => '1,234,567'
export const formatInteger = (num: number): string =>
  numeral(num).format('0,0');
