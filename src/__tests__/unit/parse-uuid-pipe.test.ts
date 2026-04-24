import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from 'src/common/pipes/parse-uuid.pipe';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ParseUUIDPipe', () => {
  let pipe: ParseUUIDPipe;

  beforeEach(() => {
    pipe = new ParseUUIDPipe();
  });

  describe('valid UUID v4', () => {
    it('should return the same value for a valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = pipe.transform(validUuid);
      expect(result).toBe(validUuid);
    });

    it('should accept uppercase UUID v4', () => {
      const validUuidUpper = '550E8400-E29B-41D4-A716-446655440000';
      const result = pipe.transform(validUuidUpper);
      expect(result).toBe(validUuidUpper.toLowerCase());
    });

    it('should accept mixed-case UUID v4', () => {
      const mixedUuid = '550E8400-e29b-41d4-A716-446655440000';
      const result = pipe.transform(mixedUuid);
      expect(result).toBe(mixedUuid.toLowerCase());
    });
  });

  describe('invalid UUID', () => {
    it('should throw BadRequestException for a non-UUID string', () => {
      expect(() => pipe.transform('not-a-uuid')).toThrow(BadRequestException);
      expect(() => pipe.transform('not-a-uuid')).toThrow(
        'ID should be valid UUID v4',
      );
    });

    it('should throw BadRequestException for empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UUID v1', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';
      expect(() => pipe.transform(uuidV1)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UUID v5', () => {
      const uuidV5 = '550e8400-e29b-51d4-a716-446655440000';
      expect(() => pipe.transform(uuidV5)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for incorrectly formatted UUID (wrong length)', () => {
      const shortUuid = '550e8400-e29b-41d4-a716-44665544000';
      expect(() => pipe.transform(shortUuid)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UUID with invalid hex characters', () => {
      const invalidHex = 'zzzzzzzz-e29b-41d4-a716-446655440000';
      expect(() => pipe.transform(invalidHex)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null value', () => {
      expect(() => pipe.transform(null as unknown as string)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for undefined value', () => {
      expect(() => pipe.transform(undefined as unknown as string)).toThrow(
        BadRequestException,
      );
    });
  });
});
