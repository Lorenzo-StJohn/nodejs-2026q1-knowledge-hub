import { Module } from '@nestjs/common';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PersistenceModule } from 'src/infrastructure/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
