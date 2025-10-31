import { Table, Column, Model, DataType, PrimaryKey, HasMany } from 'sequelize-typescript';

// Model: Highlight master data (highlight table)
@Table({ tableName: 'highlight', timestamps: false })
export class Highlight extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  highlight_id!: string;

  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.STRING(500))
  icon_url!: string | null;

  @Column(DataType.TEXT)
  description!: string | null;

  @Column(DataType.STRING(50))
  category!: string;

  @Column(DataType.DATE)
  created_at!: Date;
}
