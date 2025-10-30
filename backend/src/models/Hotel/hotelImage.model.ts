import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';

// Model: Hình ảnh khách sạn (hotel_image table)
@Table({ tableName: 'hotel_image', timestamps: false })
export class HotelImage extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  image_id!: string;

  @ForeignKey(() => require('./hotel.model').Hotel)
  @Column(DataType.STRING(20))
  hotel_id!: string;

  @Column(DataType.STRING(500))
  image_url!: string;

  @Column(DataType.TINYINT)
  is_primary!: number;

  @Column(DataType.STRING(255))
  caption!: string | null;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.DATE)
  created_at!: Date;

  // Association
  @BelongsTo(() => require('./hotel.model').Hotel)
  hotel!: any;
}


