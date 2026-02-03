import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  region_name!: string;

  @Column('varchar')
  geography_type!: string;

  @Column('text', { nullable: true })
  countries?: string;

  @Column('varchar', { nullable: true })
  sub_region?: string;

  @Column('varchar', { nullable: true })
  scope?: string;

  @Column('text')
  ecosystems!: string; // JSON stringified array

  @Column('text', { nullable: true })
  gis_url?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
