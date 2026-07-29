import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

export type CatalogEventType =
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.published'
  | 'category.created'
  | 'brand.created';

@Injectable()
export class CatalogEventService {
  private readonly logger = new Logger(CatalogEventService.name);
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit(event: CatalogEventType, payload: any) {
    this.logger.log(`Domain Event Emitted: [${event}] -> ${JSON.stringify(payload)}`);
    this.emitter.emit(event, payload);
  }

  on(event: CatalogEventType, listener: (payload: any) => void) {
    this.emitter.on(event, listener);
  }
}
