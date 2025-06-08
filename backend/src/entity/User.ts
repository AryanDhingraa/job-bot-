import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ type: 'enum', enum: ['candidate', 'lecturer', 'admin'] })
  role!: 'candidate' | 'lecturer' | 'admin';

  @CreateDateColumn()
  date_joined!: Date;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ default: false })
  is_blocked!: boolean;
} 