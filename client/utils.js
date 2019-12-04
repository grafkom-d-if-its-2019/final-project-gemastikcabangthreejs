const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const roundDecimal = (num, numberOfDecimal = 1) => {
  var x = Math.round(Math.pow(10, numberOfDecimal));
  return Math.round(num * x) / x;
};

export { randomNumber, roundDecimal };
