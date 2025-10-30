import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

// Model: Danh mục khách sạn (hotel_category table)
@Table({ tableName: 'hotel_category', timestamps: false })
export class Category extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  category_id!: string;

  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.STRING(255))
  description!: string | null;

  @Column(DataType.STRING(100))
  icon!: string | null;

  @Column(DataType.DATE)
  created_at!: Date;
}
