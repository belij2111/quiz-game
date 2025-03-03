import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { appSetup } from '../../src/setup/app.setup';
import { CoreConfig } from '../../src/core/core.config';
import { initAppModule } from '../../src/init-app-module';
import { deleteAllData } from './delete-all-data';

export const initSettings = async (
  service?: any,
  serviceMock?: any,
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const dynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [dynamicAppModule],
  })
    .overrideProvider(service)
    .useClass(serviceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  await appSetup(app, coreConfig);
  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    coreConfig,
  };
};
