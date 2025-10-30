import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, AutoIncrement } from 'sequelize-typescript';

// Model: Chính sách phòng (room_policy table)
@Table({ tableName: 'room_policy', timestamps: false })
export class RoomPolicy extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => require('./room.model').Room)
  @Column(DataType.STRING(20))
  room_id!: string;

  @Column(DataType.STRING(50))
  policy_key!: string;

  @Column(DataType.TEXT)
  value!: string;

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;

  // Association
  @BelongsTo(() => require('./room.model').Room)
  room!: any;
}


