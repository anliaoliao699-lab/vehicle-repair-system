import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';
export declare class LogsService {
    private readonly logRepository;
    constructor(logRepository: Repository<Log>);
    create(createDto: any): Promise<Log[]>;
    findAll(filters?: any): Promise<Log[]>;
}
