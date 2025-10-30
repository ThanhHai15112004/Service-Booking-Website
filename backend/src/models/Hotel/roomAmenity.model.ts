import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

// Model: Junction table - Room ↔ Facility (room_amenity table)
@Table({ tableName: 'room_amenity', timestamps: false })
export class RoomAmenity extends Model {
  @ForeignKey(() => require('./room.model').Room)
  @Column(DataType.STRING(20))
  room_id!: string;

  @ForeignKey(() => require('./facility.model').Facility)
  @Column(DataType.STRING(20))
  facility_id!: string;

  @Column(DataType.DATE)
  created_at!: Date;

  // Associations
  @BelongsTo(() => require('./room.model').Room)
  room!: any;

  @BelongsTo(() => require('./facility.model').Facility)
  facility!: any;
}


