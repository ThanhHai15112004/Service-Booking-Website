import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';

// Model: Hình ảnh phòng (room_image table)
@Table({ tableName: 'room_image', timestamps: false })
export class RoomImage extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  image_id!: string;

  @ForeignKey(() => require('./roomType.model').RoomType)
  @Column(DataType.STRING(20))
  room_type_id!: string;

  @Column(DataType.STRING(500))
  image_url!: string;

  @Column(DataType.STRING(255))
  image_alt!: string | null;

  @Column(DataType.TINYINT)
  is_primary!: number;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.DATE)
  created_at!: Date;

  // Association
  @BelongsTo(() => require('./roomType.model').RoomType)
  roomType!: any;
}


