// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,Check} from 'typeorm';
import { Exclude } from 'class-transformer';


export enum UserRole {
  OWNER = 'owner',
  WORKER = 'worker',
  ADMIN = 'admin',
}

@Entity('users')
@Check('check_login_methods', '(phone IS NOT NULL) OR (wechatOpenId IS NOT NULL)')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'phone', unique: true, nullable: false })
  phone: string;

  @Column({ name: 'password', nullable: true })
  @Exclude()
  password: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.OWNER })
  role: UserRole;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'wechat_open_id', nullable: true })
  wechatOpenId: string;

  @Column({ name: 'wechat_union_id', nullable: true })
  wechatUnionId: string;

  @Column({ name: 'wechat_session_key', nullable: true })
  wechatSessionKey: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email', nullable: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
