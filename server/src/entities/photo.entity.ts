import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkOrder } from './work-order.entity';
import { User } from './user.entity';

export enum PhotoType {
  BEFORE = 'before',
  PROGRESS = 'progress',
  AFTER = 'after',
  MATERIAL = 'material',
}

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workOrderId: number;

  @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column()
  url: string;

  @Column()
  key: string;

  @Column({
    type: 'enum',
    enum: PhotoType,
    default: PhotoType.PROGRESS,
  })
  type: PhotoType;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  uploadedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
