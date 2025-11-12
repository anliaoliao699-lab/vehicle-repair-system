import { ConfigService } from '@nestjs/config';
import { YourService } from './order.service';
export declare class YourController {
    private configService;
    private yourService;
    constructor(configService: ConfigService, yourService: YourService);
    getConfig(): {
        dbHost: string;
        dbPort: number;
    };
}
