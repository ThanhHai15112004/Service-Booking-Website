import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

// Model: Loại chính sách (policy_type table)
@Table({ tableName: 'policy_type', timestamps: false })
export class PolicyType extends Model {
  @PrimaryKey
  @Column(DataType.STRING(50))
  policy_key!: string;

  @Column(DataType.STRING(100))
  name_vi!: string;

  @Column(DataType.STRING(100))
  name_en!: string | null;

  @Column(DataType.TEXT)
  description!: string | null;

  @Column(DataType.STRING(255))
  icon!: string | null;

  @Column(DataType.INTEGER)
  display_order!: number;
}