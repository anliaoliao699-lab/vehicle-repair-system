import { LogsService } from './logs.service';
export declare class LogsController {
    private logsService;
    constructor(logsService: LogsService);
    findAll(filters: any): Promise<import("../entities/log.entity").Log[]>;
}
