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

  @Column(DataType.INTEGER)
  size_sqm!: number | null;

  @Column(DataType.INTEGER)
  max_occupancy!: number;

  @Column(DataType.STRING(50))
  bed_type!: string | null;

  @Column(DataType.STRING(50))
  view_type!: string | null;

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

