import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';
import { CoreConfig } from 'src/core/core.config';

export function swaggerSetup(app: INestApplication, coreConfig: CoreConfig) {
  if (coreConfig.isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          description: 'Enter JWT Bearer token only',
        },
        'bearer',
      )
      .addBasicAuth()
      .addApiKey(
        {
          type: 'apiKey',
          description:
            'JWT refreshToken inside cookie. Must be correct, and must not expire',
          name: 'refreshToken',
          in: 'cookie',
        },
        'refreshToken',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(GLOBAL_PREFIX + 'swagger', app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
}
