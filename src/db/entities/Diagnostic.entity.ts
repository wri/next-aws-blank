import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('diagnostic')
@Index(['version', 'language'], { unique: true })
export class Diagnostic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  questions!: string; // JSON stringified array

  @Column('varchar')
  version!: string;

  @Column('varchar', { length: 2 })
  language!: string;

  @CreateDateColumn()
  creation_date!: Date;
}
