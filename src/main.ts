import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return serverlessExpress({ app: expressApp });
}

export const handler = async (event, context) => {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }
    return cachedServer(event, context);
  } catch (err) {
    console.error('BOOT ERROR:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server failed to start' }),
    };
  }
};