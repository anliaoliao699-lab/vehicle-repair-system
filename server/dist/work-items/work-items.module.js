"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const work_items_service_1 = require("./work-items.service");
const work_items_controller_1 = require("./work-items.controller");
const work_item_entity_1 = require("../entities/work-item.entity");
let WorkItemsModule = class WorkItemsModule {
};
exports.WorkItemsModule = WorkItemsModule;
exports.WorkItemsModule = WorkItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([work_item_entity_1.WorkItem])],
        controllers: [work_items_controller_1.WorkItemsController],
        providers: [work_items_service_1.WorkItemsService],
        exports: [work_items_service_1.WorkItemsService],
    })
], WorkItemsModule);
//# sourceMappingURL=work-items.module.js.map