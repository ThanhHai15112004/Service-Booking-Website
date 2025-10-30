import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';

// Model: Lịch giá và phòng trống theo ngày (room_price_schedule table)
@Table({ tableName: 'room_price_schedule', timestamps: false })
export class RoomPriceSchedule extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  schedule_id!: string;

  @ForeignKey(() => require('./room.model').Room)
  @Column(DataType.STRING(20))
  room_id!: string;

  @Column(DataType.DATEONLY)
  date!: string;

  @Column(DataType.DECIMAL(10, 2))
  base_price!: number;

  @Column(DataType.DECIMAL(5, 2))
  discount_percent!: number;

  @Column(DataType.INTEGER)
  available_rooms!: number;

  @Column(DataType.TINYINT)
  refundable!: number;

  @Column(DataType.TINYINT)
  pay_later!: number;

  @Column(DataType.DATE)
  created_at!: Date;

  // Association
  @BelongsTo(() => require('./room.model').Room)
  room!: any;
}

