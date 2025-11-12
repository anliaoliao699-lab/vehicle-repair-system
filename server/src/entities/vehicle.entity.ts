import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'plate_number', unique: true })
  plateNumber: string;

  @Column({ name: 'brand', nullable: true })
  brand: string;

  @Column({ name: 'model', nullable: true })
  model: string;

  @Column({ name: 'color', nullable: true })
  color: string;

  @Column({ name: 'vin_number', nullable: true })
  vinNumber: string;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
