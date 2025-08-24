export const toPersianDigit = (input: string | number): string => {
  let str = typeof input === 'number' ? input.toString() : input;
  
  return str.replace(/\d+/g, function(digit) {
    const enDigitArr: number[] = [];
    const peDigitArr: string[] = [];

    for (let i = 0; i < digit.length; i++) {
      enDigitArr.push(digit.charCodeAt(i));
    }

    for (let j = 0; j < enDigitArr.length; j++) {
      peDigitArr.push(
        String.fromCharCode(enDigitArr[j] + 1728)
      );
    }
    
    return peDigitArr.join('');
  });
};
