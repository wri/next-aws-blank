import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import type { Assessment } from './Assessment.entity'

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'region_name', type: 'varchar' })
  regionName!: string

  @Column({ name: 'geography_type', type: 'varchar' })
  geographyType!: string

  @Column({ type: 'text', nullable: true })
  countries!: string | null

  @Column({ name: 'sub_region', type: 'varchar', nullable: true })
  subRegion!: string | null

  @Column({ type: 'varchar', nullable: true })
  scope!: string | null

  @Column({ type: 'text' })
  ecosystems!: string

  @Column({ name: 'gis_url', type: 'text', nullable: true })
  gisUrl!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany('Assessment', 'region')
  assessments!: Assessment[]
}
