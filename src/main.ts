import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Response } from 'express';

let cachedApp: any;

async function createServer() {
  if (cachedApp) return cachedApp;

  const expressApp = express();

  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "This endpoint is not available in E-commerce." });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(event, context) {
  try {
    if (!cachedApp) {
      cachedApp = await createServer();
    }
    return cachedApp(event, context);
  } catch (err) {
    console.error('BOOT ERROR:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server failed to start' }),
    };
  }
}