import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../application/testing.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('/testing/all-data')
@ApiTags('Testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    return this.testingService.deleteAllData();
  }
}
