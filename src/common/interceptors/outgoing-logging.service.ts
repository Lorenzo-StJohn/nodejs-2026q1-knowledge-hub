// common/interceptors/outgoing-logging.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppLogger } from 'src/common/logger/logger.service';
import { sanitizeSensitiveData } from 'src/common/utils/sanitize.util';

@Injectable()
export class OutgoingLoggingInterceptor implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    const axios = this.httpService.axiosRef;

    axios.interceptors.request.use((config) => {
      const startTime = Date.now();
      (config as any)._startTime = startTime;

      const sanitizedUrl =
        config.url?.replace(/key=([^&]*)/, 'key=[REDACTED]') || '';
      const sanitizedBody = sanitizeSensitiveData(config.data);

      this.logger.log(
        `[OUTGOING REQUEST] ${config.method?.toUpperCase()} ${sanitizedUrl} | Body: ${JSON.stringify(sanitizedBody)}`,
        'OutgoingHTTP',
      );
      return config;
    });

    axios.interceptors.response.use(
      (response) => {
        const duration = (response.config as any)._startTime
          ? Date.now() - (response.config as any)._startTime
          : 0;
        this.logger.log(
          `[OUTGOING RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url?.replace(/key=([^&]*)/, 'key=[REDACTED]')} | Status: ${response.status} | ${duration}ms`,
          'OutgoingHTTP',
        );
        return response;
      },
      (error) => {
        const config = error.config;
        const duration = config?._startTime
          ? Date.now() - config._startTime
          : 0;
        this.logger.error(
          `[OUTGOING RESPONSE ERROR] ${config?.method?.toUpperCase()} ${config?.url?.replace(/key=([^&]*)/, 'key=[REDACTED]')} | Status: ${error.response?.status} | ${duration}ms | ${error.message}`,
          error.stack,
          'OutgoingHTTP',
        );
        return Promise.reject(error);
      },
    );
  }
}
