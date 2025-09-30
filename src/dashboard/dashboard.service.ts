import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { user_stats } from '../database/user_stats';
import { Schema } from '../schema';

@Injectable()
export class DashboardService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<Schema>) {}

  async findOne(id: number) {
    const stats = await this.db
      .select()
      .from(user_stats)
      .where(eq(user_stats.user_id, id))
      .limit(1);

    if (stats.length === 0) {
      return {
        user_id: id,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
      };
    }

    return stats[0];
  }
}
