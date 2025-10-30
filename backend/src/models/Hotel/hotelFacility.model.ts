import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

// Model: Junction table - Hotel ↔ Facility (hotel_facility table)
@Table({ tableName: 'hotel_facility', timestamps: false })
export class HotelFacility extends Model {
  @ForeignKey(() => require('./hotel.model').Hotel)
  @Column(DataType.STRING(20))
  hotel_id!: string;

  @ForeignKey(() => require('./facility.model').Facility)
  @Column(DataType.STRING(20))
  facility_id!: string;

  @Column(DataType.DATE)
  created_at!: Date;

  // Associations
  @BelongsTo(() => require('./hotel.model').Hotel)
  hotel!: any;

  @BelongsTo(() => require('./facility.model').Facility)
  facility!: any;
}

