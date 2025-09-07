import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Logger } from '@nestjs/common';

export class SpanExporter {
  private static instance: SpanExporter;
  private readonly sdk: NodeSDK;
  private readonly logger = new Logger(SpanExporter.name);

  private constructor(env: string) {
    const url = process.env['JAEGER_URL'] || this.getCollectorUrl(env);

    this.sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url,
      }),
    });
  }

  static getInstance(env: string): SpanExporter {
    if (!SpanExporter.instance) {
      SpanExporter.instance = new SpanExporter(env);
    }

    return SpanExporter.instance;
  }

  start() {
    this.logger.log('Starting OpenTelemetry SDK...');
    this.sdk.start();
    registerInstrumentations({
      instrumentations: [new HttpInstrumentation(), new GrpcInstrumentation()],
    });
    this.logger.log('OpenTelemetry SDK started successfully.');
  }

  stop() {
    this.logger.log('Shutting down OpenTelemetry SDK...');
    this.sdk.shutdown().then(() => {
      this.logger.log('OpenTelemetry SDK shut down successfully.');
    });
  }

  private getCollectorUrl(env: string): string {
    switch (env.toLowerCase()) {
      case 'prod':
      case 'production':
        return 'grpcs://otel-collector.atozgames.net:443';
      case 'stage':
      case 'staging':
        return 'grpcs://otel-collector.staging.atozgames.net:443';
      case 'dev':
      case 'develop':
      case 'development':
      default:
        return 'grpcs://otel-collector.dev.atozgames.net:443';
    }
  }
}
