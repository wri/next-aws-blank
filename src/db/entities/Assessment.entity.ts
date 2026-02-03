import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Lead } from './Lead.entity';
import { Region } from './Region.entity';
import { Diagnostic } from './Diagnostic.entity';

export enum ProjectType {
  GEF_8 = 'GEF_8',
  WRI = 'WRI',
  OTHER = 'other'
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  @Index()
  diagnostic_id!: string;

  @Column('text')
  password_hash!: string;

  @CreateDateColumn()
  creation_date!: Date;

  @UpdateDateColumn({ nullable: true })
  last_update?: Date;

  @Column('timestamp', { nullable: true })
  submission_date?: Date;

  @Column('varchar', { length: 4 })
  diagnostic_year!: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.OTHER
  })
  project_type!: ProjectType;

  @Column('varchar', { length: 50, default: 'draft' })
  status!: string;

  @Column('uuid')
  @Index()
  lead_id!: string;

  @Column('uuid')
  @Index()
  region_id!: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;

  @ManyToOne(() => Region, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region!: Region;

  @ManyToOne(() => Diagnostic, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'diagnostic_id' })
  diagnostic!: Diagnostic;
}
