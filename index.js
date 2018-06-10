const BYTE_SIZE = 8;

const createByte = {
  withTrailingBits(num) {
    let byte = 0;
    for (let i = 0; i < num; i++) {
      byte += 2**i;
    }

    return byte;
  },
  withLeadingBits(num) {
    let byte = 0;
    for (let i = 0; i < num; i++) {
      byte += (2**(BYTE_SIZE - 1 - i));
    }

    return byte;
  }
};

const T = {
  ONE_LEADING_BITS: createByte.withLeadingBits(1),
  TWO_LEADING_BITS: createByte.withLeadingBits(2),
  THREE_LEADING_BITS: createByte.withLeadingBits(3),
  FOUR_LEADING_BITS: createByte.withLeadingBits(4),
  FIVE_LEADING_BITS: createByte.withLeadingBits(5),
}

export default {
  stripLeadingBits(byte, numOfLeadingBits) {
    const withTrailingBits = createByte.withTrailingBits(BYTE_SIZE - 1 - numOfLeadingBits);

    return byte & withTrailingBits;
  },

  mergeBytes(byteView, start = 0, length = byteView.length) {
    let bytes = this.stripLeadingBits(byteView[start], length);

    for (let i = start + 1; i < length; i++) {
      const continuationByte = byteView[i];
      bytes <<= 6;
      bytes += this.stripLeadingBits(continuationByte, 1);
    }

    return bytes;
  },

  getLeadingBitsCount(byte) {
    if ((byte & T.FIVE_LEADING_BITS) === T.FOUR_LEADING_BITS) {
      return 4;
    }

    if ((byte & T.FOUR_LEADING_BITS) === T.THREE_LEADING_BITS) {
      return 3;
    }

    if ((byte & T.THREE_LEADING_BITS) === T.TWO_LEADING_BITS) {
      return 2;
    }

    if ((byte & T.TWO_LEADING_BITS) === T.ONE_LEADING_BITS) {
      return 1;
    }

    if ((byte & T.ONE_LEADING_BITS) === 0) {
      return 0;
    }

    throw new Error('Invalid byte. It should have 0-4 leading bits');
  },

  *getCodePoints(binary) {
    let currentCodePoint = 0;

    for (let i = 0; i < binary.length; i++) {
      const byte = binary[i];
      const leadingBits = this.getLeadingBitsCount(byte);

      if (leadingBits === 0) {
        yield byte;
      } else {
        const bytesView = new Uint8Array(binary.buffer, i, leadingBits);
        const codePoint = this.mergeBytes(bytesView);

        yield codePoint;
        i += leadingBits - 1;
      }
    }
  }
}
