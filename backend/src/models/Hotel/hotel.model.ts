import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';

// Model: Khách sạn (hotel table)
@Table({ tableName: 'hotel', timestamps: false })
export class Hotel extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  hotel_id!: string;

  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  description!: string | null;

  @ForeignKey(() => require('./category.model').Category)
  @Column(DataType.STRING(20))
  category_id!: string | null;

  @ForeignKey(() => require('./location.model').Location)
  @Column(DataType.STRING(20))
  location_id!: string | null;

  @Column(DataType.STRING(255))
  address!: string | null;

  @Column(DataType.DECIMAL(10, 6))
  latitude!: number | null;

  @Column(DataType.DECIMAL(10, 6))
  longitude!: number | null;

  @Column(DataType.DECIMAL(2, 1))
  star_rating!: number | null;

  @Column(DataType.DECIMAL(2, 1))
  avg_rating!: number;

  @Column(DataType.INTEGER)
  review_count!: number;

  @Column(DataType.TIME)
  checkin_time!: string;

  @Column(DataType.TIME)
  checkout_time!: string;

  @Column(DataType.STRING(30))
  phone_number!: string | null;

  @Column(DataType.STRING(255))
  email!: string | null;

  @Column(DataType.STRING(255))
  website!: string | null;

  @Column(DataType.INTEGER)
  total_rooms!: number;

  @Column(DataType.STRING(500))
  main_image!: string | null;

  @Column(DataType.STRING(20))
  status!: 'ACTIVE' | 'INACTIVE' | 'PENDING';

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;

  // Associations
  @BelongsTo(() => require('./category.model').Category)
  category!: any;

  @BelongsTo(() => require('./location.model').Location)
  location!: any;

  @HasMany(() => require('./hotelImage.model').HotelImage)
  images!: any[];

  @HasMany(() => require('./roomType.model').RoomType)
  roomTypes!: any[];

  @BelongsToMany(() => require('./facility.model').Facility, () => require('./hotelFacility.model').HotelFacility)
  facilities!: any[];
}
