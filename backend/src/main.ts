import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppModule } from "./app.module";

function loadLocalEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function bootstrap() {
  loadLocalEnvFile();
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.setGlobalPrefix("api");
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
