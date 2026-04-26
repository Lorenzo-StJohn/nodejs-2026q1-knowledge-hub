import { AppLogger } from 'src/common/logger/logger.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockInfo,
  mockError,
  mockWarn,
  mockDebug,
  mockVerbose,
  createLoggerMock,
  consoleTransportMock,
  fileTransportMock,
} = vi.hoisted(() => {
  const mockInfo = vi.fn();
  const mockError = vi.fn();
  const mockWarn = vi.fn();
  const mockDebug = vi.fn();
  const mockVerbose = vi.fn();

  const mockLoggerInstance = {
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
    debug: mockDebug,
    verbose: mockVerbose,
  };

  const createLoggerMock = vi.fn(() => mockLoggerInstance);
  const consoleTransportMock = vi.fn();
  const fileTransportMock = vi.fn();

  return {
    mockInfo,
    mockError,
    mockWarn,
    mockDebug,
    mockVerbose,
    mockLoggerInstance,
    createLoggerMock,
    consoleTransportMock,
    fileTransportMock,
  };
});

vi.mock(import('path'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    join: vi.fn((...parts: string[]) => parts.join('/')),
    default: {
      ...actual.default,
      join: vi.fn((...parts: string[]) => parts.join('/')),
    },
  };
});

vi.mock('src/common/logger/size-rotating-file.transport', () => ({
  SizeRotatingFileTransport: fileTransportMock,
}));

vi.mock('winston-daily-rotate-file', () => ({}));

vi.mock('winston', () => ({
  default: {
    createLogger: createLoggerMock,

    transports: {
      Console: consoleTransportMock,
    },

    format: {
      combine: vi.fn(() => 'combined-format'),
      timestamp: vi.fn(() => 'timestamp-format'),
      errors: vi.fn(() => 'errors-format'),
      splat: vi.fn(() => 'splat-format'),
      json: vi.fn(() => 'json-format'),
      colorize: vi.fn(() => 'colorize-format'),
      simple: vi.fn(() => 'simple-format'),
    },
  },

  createLogger: createLoggerMock,

  transports: {
    Console: consoleTransportMock,
  },

  format: {
    combine: vi.fn(() => 'combined-format'),
    timestamp: vi.fn(() => 'timestamp-format'),
    errors: vi.fn(() => 'errors-format'),
    splat: vi.fn(() => 'splat-format'),
    json: vi.fn(() => 'json-format'),
    colorize: vi.fn(() => 'colorize-format'),
    simple: vi.fn(() => 'simple-format'),
  },
}));

describe('AppLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_MAX_FILE_SIZE;
  });

  const createConfig = (isProduction: boolean) => ({ isProduction }) as any;

  it('should create winston logger on initialization', () => {
    new AppLogger(createConfig(true));

    expect(createLoggerMock).toHaveBeenCalledTimes(1);
  });

  it('should configure console transport', () => {
    new AppLogger(createConfig(true));

    expect(consoleTransportMock).toHaveBeenCalledTimes(1);
  });

  it('should configure file transport', () => {
    new AppLogger(createConfig(true));

    expect(fileTransportMock).toHaveBeenCalledTimes(1);
    expect(fileTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringContaining('logs/app.log'),
      }),
    );
  });

  it('should map log level "log" to info', () => {
    process.env.LOG_LEVEL = 'log';
    new AppLogger(createConfig(true));

    expect(createLoggerMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
    );
  });

  it('should map log level "debug" correctly', () => {
    process.env.LOG_LEVEL = 'debug';
    new AppLogger(createConfig(true));

    expect(createLoggerMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' }),
    );
  });

  it('should fallback unknown log level to info', () => {
    process.env.LOG_LEVEL = 'weird';
    new AppLogger(createConfig(true));

    expect(createLoggerMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
    );
  });

  it('should delegate log()', () => {
    const logger = new AppLogger(createConfig(true));
    logger.log('hello', 'App');
    expect(mockInfo).toHaveBeenCalledWith('hello', { context: 'App' });
  });

  it('should delegate error()', () => {
    const logger = new AppLogger(createConfig(true));
    logger.error('boom', 'stacktrace', 'App');
    expect(mockError).toHaveBeenCalledWith('boom', {
      trace: 'stacktrace',
      context: 'App',
    });
  });

  it('should delegate warn()', () => {
    const logger = new AppLogger(createConfig(true));
    logger.warn('warning', 'App');
    expect(mockWarn).toHaveBeenCalledWith('warning', { context: 'App' });
  });

  it('should delegate debug()', () => {
    const logger = new AppLogger(createConfig(true));
    logger.debug('dbg', 'App');
    expect(mockDebug).toHaveBeenCalledWith('dbg', { context: 'App' });
  });

  it('should delegate verbose()', () => {
    const logger = new AppLogger(createConfig(true));
    logger.verbose('verb', 'App');
    expect(mockVerbose).toHaveBeenCalledWith('verb', { context: 'App' });
  });

  describe('Log level mapping', () => {
    it.each([
      { input: 'warn', expected: 'warn' },
      { input: 'error', expected: 'error' },
      { input: 'verbose', expected: 'verbose' },
    ])('should map "$input" to "$expected"', ({ input, expected }) => {
      process.env.LOG_LEVEL = input;
      new AppLogger(createConfig(true));

      expect(createLoggerMock).toHaveBeenCalledWith(
        expect.objectContaining({ level: expected }),
      );
    });

    it('should default to info when LOG_LEVEL is not set', () => {
      new AppLogger(createConfig(true));

      expect(createLoggerMock).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' }),
      );
    });
  });

  describe('File transport configuration', () => {
    it('should pass correct maxSize from LOG_MAX_FILE_SIZE', () => {
      process.env.LOG_MAX_FILE_SIZE = '2048';
      new AppLogger(createConfig(true));

      expect(fileTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          maxSize: 2048 * 1024,
        }),
      );
    });

    it('should fallback maxSize to 1024 if LOG_MAX_FILE_SIZE is not set', () => {
      new AppLogger(createConfig(true));

      expect(fileTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          maxSize: 1024 * 1024,
        }),
      );
    });

    it('should pass json format to file transport', () => {
      new AppLogger(createConfig(true));

      expect(fileTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'json-format',
        }),
      );
    });
  });

  it('should delegate error() without trace', () => {
    const logger = new AppLogger(createConfig(true));
    logger.error('no trace', undefined, 'App');

    expect(mockError).toHaveBeenCalledWith('no trace', {
      trace: undefined,
      context: 'App',
    });
  });
});
