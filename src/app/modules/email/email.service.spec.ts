import { EmailService } from './email.service';

describe('EmailService', () => {
  it('should call provider.send', async () => {
    const mockProvider = {
      send: jest.fn(),
    };

    const service = new EmailService(mockProvider as any);

    await service.send({
      to: 'test@email.com',
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test',
    });

    expect(mockProvider.send).toHaveBeenCalled();
  });
});
