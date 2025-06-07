import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { appSetup } from '../../src/setup/app.setup';
import { CoreConfig } from '../../src/core/core.config';
import { initAppModule } from '../../src/init-app-module';

export const initSettings = async (
  services?: { service: any; serviceMock: any }[],
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const dynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [dynamicAppModule],
  });

  if (services) {
    for (const { service, serviceMock } of services) {
      testingModuleBuilder.overrideProvider(service).useClass(serviceMock);
    }
  }

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  await appSetup(app, coreConfig);
  await app.init();

  const httpServer = app.getHttpServer();

  return {
    app,
    httpServer,
    coreConfig,
  };
};
