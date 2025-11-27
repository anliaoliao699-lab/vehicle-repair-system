import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  relatedType: string;

  @Column({ nullable: true })
  relatedId: number;

  @Column({ nullable: true })
  uploadedBy: number;

  // ✅ 新增：微信云存储的 fileID
  @Column({ nullable: true })
  fileId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}