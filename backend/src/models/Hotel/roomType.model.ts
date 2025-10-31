import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

// Model: Loại phòng (room_type table)
@Table({ tableName: 'room_type', timestamps: false })
export class RoomType extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  room_type_id!: string;

  @ForeignKey(() => require('./hotel.model').Hotel)
  @Column(DataType.STRING(20))
  hotel_id!: string;

  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.TEXT)
  description!: string | null;

  @Column({ type: DataType.DECIMAL(6, 2), field: 'area' })
  size_sqm!: number | null;

  @Column(DataType.STRING(50))
  bed_type!: string | null;

  @Column({ type: DataType.STRING(500), field: 'image_url' })
  imageUrl!: string | null;

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;

  // Associations
  @BelongsTo(() => require('./hotel.model').Hotel)
  hotel!: any;

  @HasMany(() => require('./room.model').Room)
  rooms!: any[];

  @HasMany(() => require('./roomImage.model').RoomImage)
  images!: any[];
}

