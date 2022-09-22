class Principal {
  constructor(_arr) {
    this._arr = _arr;
    this._isPrincipal = true;
  }
  static fromText(text) {
    const canisterIdNoDash = text.toLowerCase().replace(/-/g, "");
    let arr = (0, decode)(canisterIdNoDash);
    arr = arr.slice(4, arr.length);
    return new this(arr);
  }
  toHex() {
    return this._arr
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
      .toUpperCase();
  }
}

const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
// Build a lookup table for decoding.
const lookupTable = Object.create(null);
for (let i = 0; i < alphabet.length; i++) {
  lookupTable[alphabet[i]] = i;
}
// Add aliases for rfc4648.
lookupTable["0"] = lookupTable.o;
lookupTable["1"] = lookupTable.i;

const decode = (input) => {
  // how many bits we have from the previous character.
  let skip = 0;
  // current byte we're producing.
  let byte = 0;
  const output = new Uint8Array(((input.length * 4) / 3) | 0);
  let o = 0;
  function decodeChar(char) {
    // Consume a character from the stream, store
    // the output in this.output. As before, better
    // to use update().
    let val = lookupTable[char.toLowerCase()];
    if (val === undefined) {
      throw new Error(`Invalid character: ${JSON.stringify(char)}`);
    }
    // move to the high bits
    val <<= 3;
    byte |= val >>> skip;
    skip += 5;
    if (skip >= 8) {
      // We have enough bytes to produce an output
      output[o++] = byte;
      skip -= 8;
      if (skip > 0) {
        byte = (val << (5 - skip)) & 255;
      } else {
        byte = 0;
      }
    }
  }
  for (const c of input) {
    decodeChar(c);
  }
  return output.slice(0, o);
};
