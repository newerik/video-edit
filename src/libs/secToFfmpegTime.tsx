import Big from 'big.js';

const pad = (input: Big, length = 2) => input.toString().padStart(length, '0');

const secToFfmpegTime = (seconds: number): string => {
  const bigSec = Big(seconds);
  const MILLISECONDS = bigSec.mod(1).times(1000);
  const MS = MILLISECONDS.div(1000);
  const SS = bigSec.minus(MS).mod(60);
  const MM = bigSec.minus(MS).minus(SS).div(60).mod(60);
  const HOURS = bigSec
    .minus(MS)
    .minus(SS)
    .minus(MM.times(60))
    .div(60 * 60);
  return `${pad(HOURS)}:${pad(MM)}:${pad(SS)}.${pad(MILLISECONDS, 3)}`;
};

export default secToFfmpegTime;
