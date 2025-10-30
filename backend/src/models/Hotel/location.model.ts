import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

// Model: Địa điểm khách sạn (hotel_location table)
@Table({ tableName: 'hotel_location', timestamps: false })
export class Location extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  location_id!: string;

  @Column(DataType.STRING(100))
  country!: string;

  @Column(DataType.STRING(100))
  city!: string;

  @Column(DataType.STRING(100))
  district!: string | null;

  @Column(DataType.STRING(100))
  ward!: string | null;

  @Column(DataType.STRING(255))
  area_name!: string | null;

  @Column(DataType.DECIMAL(10, 6))
  latitude!: number | null;

  @Column(DataType.DECIMAL(10, 6))
  longitude!: number | null;

  @Column(DataType.DECIMAL(6, 2))
  distance_center!: number;

  @Column(DataType.STRING(255))
  description!: string | null;

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.TINYINT)
  is_hot!: number;
}