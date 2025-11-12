import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDailyReport(date: string): Promise<{
        date: string;
        totalWorkOrders: number;
        completedWorkOrders: number;
        totalRevenue: number;
        totalPayments: number;
    }>;
    getWorkerPerformance(workerId: string, startDate?: string, endDate?: string): Promise<{
        workerId: number;
        totalAssigned: number;
        completed: number;
        completionRate: string | number;
        totalRevenue: number;
    }>;
}
