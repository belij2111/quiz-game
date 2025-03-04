import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from '../../tests-managers/users-test.manager';
import { initSettings } from '../../helpers/init-settings';
import { deleteAllData } from '../../helpers/delete-all-data';
import { AuthTestManager } from '../../tests-managers/auth-test.manager';
import { CoreTestManager } from '../../tests-managers/core-test.manager';
import { SecurityDevicesTestManager } from '../../tests-managers/security-devices-test.manager';

describe('e2e-Security-Devices', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let coreTestManager: CoreTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    usersTestManager = new UsersTestManager(app, coreConfig);
    authTestManager = new AuthTestManager(app, coreConfig);
    coreTestManager = new CoreTestManager(usersTestManager, authTestManager);
    securityDevicesTestManager = new SecurityDevicesTestManager(app);
  });
  beforeEach(async () => {
    await deleteAllData(app);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('GET/security/devices', () => {
    it(`should return all devices with active sessions for the current user : STATUS 200`, async () => {
      const refreshTokens = await coreTestManager.loginSeveralUsers(3);
      const createdResponse = await securityDevicesTestManager.getAll(
        refreshTokens,
        HttpStatus.OK,
      );
      //console.log('createdResponse :', createdResponse);
      securityDevicesTestManager.expectCorrectGetDevices(createdResponse, 3);
    });
    it(`shouldn't return all devices with active sessions if the request is unauthorized : STATUS 401`, async () => {
      const refreshTokens = ['invalid refreshTokens'];
      await securityDevicesTestManager.getAll(
        refreshTokens,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('DELETE/security/devices', () => {
    it(`should delete all devices with active sessions excluding the current ones : STATUS 204`, async () => {
      const refreshTokens = await coreTestManager.loginSeveralUsers(3);
      await securityDevicesTestManager.delete(
        refreshTokens,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't delete all devices with active sessions if the request is unauthorized : STATUS 401`, async () => {
      const refreshTokens = ['invalid refreshTokens'];
      await securityDevicesTestManager.delete(
        refreshTokens,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });
});
