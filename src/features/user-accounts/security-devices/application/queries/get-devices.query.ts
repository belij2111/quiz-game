import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlQueryRepository } from '../../infrastructure/security-devices.sql.query-repository';
import { SecurityDevicesViewModel } from '../../api/models/view/security-devices.view.model';

export class GetDevicesQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler
  implements IQueryHandler<GetDevicesQuery, SecurityDevicesViewModel[]>
{
  constructor(
    private securityDevicesSqlQueryRepository: SecurityDevicesSqlQueryRepository,
  ) {}
  async execute(query: GetDevicesQuery): Promise<SecurityDevicesViewModel[]> {
    return this.securityDevicesSqlQueryRepository.getAll(query.userId);
  }
}
