import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesViewModel } from '../../api/models/view/security-devices.view.model';
import { SecurityDevicesQueryRepository } from '../../infrastructure/security-devices.query-repository';

export class GetDevicesQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler
  implements IQueryHandler<GetDevicesQuery, SecurityDevicesViewModel[]>
{
  constructor(
    private securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}
  async execute(query: GetDevicesQuery): Promise<SecurityDevicesViewModel[]> {
    return this.securityDevicesQueryRepository.getAll(query.userId);
  }
}
