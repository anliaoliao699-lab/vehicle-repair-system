import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { User } from './user.entity';

export enum WorkOrderStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  PAID = 'paid',
  CLOSED = 'closed',
}

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'order_no', unique: true, nullable: true })
  orderNo: string;

  @Column({ name: 'customer_id', nullable: true  })
  customerId: number;

  @Column({ name: 'staff_id', nullable: true })
  staffId: number;

  @Column({ name: 'vehicle_info', type: 'text' })
  vehicleInfo: string;

  @Column({ name: 'description', type: 'text', nullable: true, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  description: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.NEW,
  })
  status: WorkOrderStatus;

  @Column({ name: 'worker_roles', type: 'json', nullable: true })
  workerRoles: { [key: number]: string };

  @Column({ name: 'assigned_worker_id', type: 'int', nullable: true })
  assignedWorkerId: number;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'estimated_completion_time', type: 'datetime', nullable: true })
  estimatedCompletionTime: Date;

  @Column({ name: 'actual_completion_time', type: 'datetime', nullable: true })
  actualCompletionTime: Date;

  @Column({ name: 'priority', type: 'int', default: 1 })
  priority: number;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number;

  @Column({ name: 'vehicle_id', type: 'int', nullable: true })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'work_order_workers',
    joinColumn: { name: 'work_order_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'worker_id', referencedColumnName: 'id' }
  })
  workers: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}