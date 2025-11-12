"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrder = exports.WorkOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("./vehicle.entity");
const user_entity_1 = require("./user.entity");
var WorkOrderStatus;
(function (WorkOrderStatus) {
    WorkOrderStatus["NEW"] = "new";
    WorkOrderStatus["ASSIGNED"] = "assigned";
    WorkOrderStatus["IN_PROGRESS"] = "in_progress";
    WorkOrderStatus["ON_HOLD"] = "on_hold";
    WorkOrderStatus["COMPLETED"] = "completed";
    WorkOrderStatus["ACCEPTED"] = "accepted";
    WorkOrderStatus["PAID"] = "paid";
    WorkOrderStatus["CLOSED"] = "closed";
})(WorkOrderStatus || (exports.WorkOrderStatus = WorkOrderStatus = {}));
let WorkOrder = class WorkOrder {
};
exports.WorkOrder = WorkOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_no', unique: true, nullable: true }),
    __metadata("design:type", String)
], WorkOrder.prototype, "orderNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', nullable: true }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'staff_id', nullable: true }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "staffId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_info', type: 'text' }),
    __metadata("design:type", String)
], WorkOrder.prototype, "vehicleInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' }),
    __metadata("design:type", String)
], WorkOrder.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: WorkOrderStatus,
        default: WorkOrderStatus.NEW,
    }),
    __metadata("design:type", String)
], WorkOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'worker_roles', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkOrder.prototype, "workerRoles", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_worker_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "assignedWorkerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_cost', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "estimatedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_cost', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_completion_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], WorkOrder.prototype, "estimatedCompletionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_completion_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], WorkOrder.prototype, "actualCompletionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkOrder.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], WorkOrder.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", user_entity_1.User)
], WorkOrder.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'work_order_workers',
        joinColumn: { name: 'work_order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'worker_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], WorkOrder.prototype, "workers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkOrder.prototype, "updatedAt", void 0);
exports.WorkOrder = WorkOrder = __decorate([
    (0, typeorm_1.Entity)('work_orders')
], WorkOrder);
//# sourceMappingURL=work-order.entity.js.map