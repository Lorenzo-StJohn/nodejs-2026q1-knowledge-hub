import * as fs from 'node:fs';
import * as path from 'node:path';
import { Format } from 'logform';

import * as TransportModule from 'winston-transport';
const Transport = (TransportModule as any).default || TransportModule;

export interface SizeRotatingFileOptions {
  filename: string;
  maxSize: number;
  format?: Format;
  level?: string;
}

export class SizeRotatingFileTransport extends Transport {
  private filename: string;
  private maxSize: number;
  private currentSize: number;
  private writeStream: fs.WriteStream | null;

  constructor(opts: SizeRotatingFileOptions) {
    super(opts);
    this.filename = opts.filename;
    this.maxSize = opts.maxSize;
    this.currentSize = 0;
    this.writeStream = null;
    this.createWriteStream();
  }

  private createWriteStream() {
    if (this.writeStream) {
      this.writeStream.end();
    }
    const dir = path.dirname(this.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.writeStream = fs.createWriteStream(this.filename, { flags: 'a' });
    this.currentSize = fs.existsSync(this.filename)
      ? fs.statSync(this.filename).size
      : 0;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const formatted = this.format ? this.format.transform(info, info) : info;
    const logLine =
      (typeof formatted === 'string' ? formatted : JSON.stringify(formatted)) +
      '\n';
    const logLength = Buffer.byteLength(logLine);

    if (this.currentSize + logLength > this.maxSize && this.currentSize > 0) {
      this.rotateFile();
    }

    this.writeStream?.write(logLine, () => {
      this.currentSize += logLength;
      callback();
    });
  }

  private rotateFile() {
    if (this.writeStream) {
      this.writeStream.end();
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const ext = path.extname(this.filename);
    const base = path.basename(this.filename, ext);
    const dir = path.dirname(this.filename);
    const newName = path.join(dir, `${base}-${timestamp}${ext}`);

    try {
      fs.renameSync(this.filename, newName);
    } catch (err) {}

    this.createWriteStream();
  }
}
