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
exports.WorkItemMaterial = exports.MaterialRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const work_item_entity_1 = require("./work-item.entity");
const material_entity_1 = require("./material.entity");
const user_entity_1 = require("./user.entity");
var MaterialRequestStatus;
(function (MaterialRequestStatus) {
    MaterialRequestStatus["PENDING"] = "pending";
    MaterialRequestStatus["APPROVED"] = "approved";
    MaterialRequestStatus["REJECTED"] = "rejected";
})(MaterialRequestStatus || (exports.MaterialRequestStatus = MaterialRequestStatus = {}));
let WorkItemMaterial = class WorkItemMaterial {
};
exports.WorkItemMaterial = WorkItemMaterial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_item_id' }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "workItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => work_item_entity_1.WorkItem),
    (0, typeorm_1.JoinColumn)({ name: 'work_item_id' }),
    __metadata("design:type", work_item_entity_1.WorkItem)
], WorkItemMaterial.prototype, "workItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_id' }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => material_entity_1.Material),
    (0, typeorm_1.JoinColumn)({ name: 'material_id' }),
    __metadata("design:type", material_entity_1.Material)
], WorkItemMaterial.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: MaterialRequestStatus,
        default: MaterialRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], WorkItemMaterial.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by' }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requested_by' }),
    __metadata("design:type", user_entity_1.User)
], WorkItemMaterial.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", Number)
], WorkItemMaterial.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", user_entity_1.User)
], WorkItemMaterial.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkItemMaterial.prototype, "createdAt", void 0);
exports.WorkItemMaterial = WorkItemMaterial = __decorate([
    (0, typeorm_1.Entity)('work_item_materials')
], WorkItemMaterial);
//# sourceMappingURL=work-item-material.entity.js.map