import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';

// Model: Phòng (room table)
@Table({ tableName: 'room', timestamps: false })
export class Room extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  room_id!: string;

  @ForeignKey(() => require('./roomType.model').RoomType)
  @Column(DataType.STRING(20))
  room_type_id!: string;

  @Column(DataType.STRING(20))
  room_number!: string | null;

  @Column(DataType.INTEGER)
  capacity!: number;

  @Column(DataType.STRING(500))
  image_url!: string | null;

  @Column(DataType.DECIMAL(12, 2))
  price_base!: number | null;

  @Column(DataType.STRING(20))
  status!: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;

  // Associations
  @BelongsTo(() => require('./roomType.model').RoomType)
  roomType!: any;

  @HasMany(() => require('./roomPriceSchedule.model').RoomPriceSchedule)
  priceSchedules!: any[];

  @HasMany(() => require('./roomPolicy.model').RoomPolicy)
  policies!: any[];

  @BelongsToMany(() => require('./facility.model').Facility, () => require('./roomAmenity.model').RoomAmenity)
  amenities!: any[];
}

