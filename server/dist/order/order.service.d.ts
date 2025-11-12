import { ConfigService } from '@nestjs/config';
export declare class YourService {
    private configService;
    constructor(configService: ConfigService);
    getConfig(): {
        dbHost: string;
        dbPort: number;
    };
}
