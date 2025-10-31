import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

// Model: Loại giường (bed_type_metadata table)
@Table({ tableName: 'bed_type_metadata', timestamps: false })
export class BedType extends Model {
  @PrimaryKey
  @Column(DataType.STRING(50))
  bed_type_key!: string;

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
