import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Utf8Parser from './';

const readFile = promisify(fs.readFile);

describe('Utf8Parser', () => {
  describe('#getCodePoints', () => {
    let buffer;

    beforeAll(async () => {
      const fixture = path.resolve(__dirname, 'fixtures', 'demo.txt');
      buffer = await readFile(fixture);
    });

    it('parses utf8 codepoints', () => {
      const result = Array.from(Utf8Parser.getCodePoints(buffer));
      // Compare results against node's own ut8-parser
      expect(result).toEqual(buffer.toString('utf-8').split('').map((char) => char.charCodeAt(0)));
    });
  });

  describe('#getLeadingBitsCount', () => {
    it('gets the leading bis counts', () => {
      expect(Utf8Parser.getLeadingBitsCount(0b11110101)).toBe(4);
      expect(Utf8Parser.getLeadingBitsCount(0b11100101)).toBe(3);
      expect(Utf8Parser.getLeadingBitsCount(0b11000101)).toBe(2);
      expect(Utf8Parser.getLeadingBitsCount(0b10000101)).toBe(1);
      expect(Utf8Parser.getLeadingBitsCount(0b00000101)).toBe(0);
    });
  });

  describe('#stripLeadingBits', () => {
    it('removes the number of leading bits', () => {
      expect(Utf8Parser.stripLeadingBits(0b11110101, 4)).toBe(0b00000101);
      expect(Utf8Parser.stripLeadingBits(0b11100101, 3)).toBe(0b00000101);
      expect(Utf8Parser.stripLeadingBits(0b11000101, 2)).toBe(0b00000101);
      expect(Utf8Parser.stripLeadingBits(0b10000101, 1)).toBe(0b00000101);
    });
  });

  describe('#mergeBytes', () => {
    it('merges bytes', () => {
      expect(Utf8Parser.mergeBytes([
        0b11010101,
        0b10110110
      ])).toBe(0b10101110110);

      expect(Utf8Parser.mergeBytes([
        0b11110101,
        0b10110110,
        0b10110110,
        0b10110110
      ])).toBe(0b101110110110110110110);
    });
  });
});
