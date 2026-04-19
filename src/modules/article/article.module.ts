import { Module } from '@nestjs/common';

import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PersistenceModule } from 'src/infrastructure/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
