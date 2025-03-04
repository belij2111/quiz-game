import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class SecurityDevicesTestManager {
  constructor(private readonly app: INestApplication) {}

  async getAll(refreshTokens: string[], statusCode: number = HttpStatus.OK) {
    const cookies = refreshTokens
      .map((token) => `refreshToken=${token}`)
      .join('; ');
    const response = await request(this.app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', cookies)
      .expect(statusCode);
    return response.body;
  }

  expectCorrectGetDevices(createdResponse: [], count: number) {
    expect(createdResponse).toBeInstanceOf(Array);
    expect(createdResponse).toHaveLength(count);
    createdResponse.forEach((device) => {
      expect(device).toHaveProperty('ip');
      expect(device).toHaveProperty('title');
      expect(device).toHaveProperty('lastActiveDate');
      expect(device).toHaveProperty('deviceId');
    });
  }

  async delete(
    refreshTokens: string[],
    statusCode: number = HttpStatus.NO_CONTENT,
  ) {
    const cookies = refreshTokens
      .map((token) => `refreshToken=${token}`)
      .join('; ');
    await request(this.app.getHttpServer())
      .delete('/security/devices')
      .set('Cookie', cookies)
      .expect(statusCode);
  }
}
