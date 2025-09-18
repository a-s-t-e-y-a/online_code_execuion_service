import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonUseServiceService {
  async generateUniqueId() {
    return Date.now() + Math.random().toString(36).substring(2, 15);
  }
}
