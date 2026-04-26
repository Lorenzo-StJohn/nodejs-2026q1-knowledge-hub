import { AppService } from 'src/app.service';
import { Configuration } from 'src/config/configuration';
import { describe, it, expect } from 'vitest';

describe('AppService', () => {
  it('should return a string containing the port from configuration', () => {
    const mockConfig = { port: 3333 } as Configuration;
    const service = new AppService(mockConfig);
    const expectedMessage =
      'Go to http://localhost:3333/doc/ see documentation';

    const result = service.getHello();
    expect(result).toBe(expectedMessage);
  });

  it('should use a different port when configuration changes', () => {
    const mockConfig = { port: 8080 } as Configuration;
    const service = new AppService(mockConfig);

    const result = service.getHello();
    expect(result).toContain('localhost:8080');
  });
});
