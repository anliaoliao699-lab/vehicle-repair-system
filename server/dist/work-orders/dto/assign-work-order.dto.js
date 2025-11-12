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
exports.AssignWorkOrderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class WorkerAssignment {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: '工人ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], WorkerAssignment.prototype, "workerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '工作角色，如：主修/协助' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WorkerAssignment.prototype, "role", void 0);
class AssignWorkOrderDto {
}
exports.AssignWorkOrderDto = AssignWorkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [WorkerAssignment], description: '工人分配列表' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkerAssignment),
    __metadata("design:type", Array)
], AssignWorkOrderDto.prototype, "workers", void 0);
//# sourceMappingURL=assign-work-order.dto.js.map