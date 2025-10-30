import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

// Model: Tiện ích khách sạn/phòng (facility table)
@Table({ tableName: 'facility', timestamps: false })
export class Facility extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  facility_id!: string;

  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.STRING(10))
  category!: 'HOTEL' | 'ROOM';

  @Column(DataType.STRING(100))
  icon!: string | null;

  @Column(DataType.DATE)
  created_at!: Date;
}
