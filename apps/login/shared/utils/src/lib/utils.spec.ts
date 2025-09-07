import { logger } from './utils';

describe('Logger', () => {
  it('should log messages at debug level', () => {
    const spy = jest.spyOn(logger.transports[0], 'log');

    const testMessage = 'Test debug message';
    logger.debug(testMessage);

    const firstCallArg = spy.mock.calls[0][0];

    expect(firstCallArg.level).toBe('debug');
    expect(firstCallArg.message).toBe(testMessage);

    spy.mockRestore();
  });
});
