import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { Request, Response } from "express";

let cachedApp: express.Express;

async function createServer(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const expressApp = express();

  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors();
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.use((req: Request, res: Response) => {
    res
      .status(404)
      .json({ message: "This endpoint is not available in E-commerce." });
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

async function bootstrap() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors();
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}

if (!process.env.VERCEL) {
  void bootstrap();
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!cachedApp) {
      cachedApp = await createServer();
    }
    return cachedApp(req, res);
  } catch (err) {
    console.error("BOOT ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server failed to start" }),
    };
  }
}
