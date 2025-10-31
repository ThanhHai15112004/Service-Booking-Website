import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey } from 'sequelize-typescript';

// Model: Junction table - Hotel ↔ Highlight (hotel_highlight table)
// ✅ FIX: Composite primary key (hotel_id, highlight_id) - KHÔNG có id field
@Table({ 
  tableName: 'hotel_highlight', 
  timestamps: false
})
export class HotelHighlight extends Model<HotelHighlight> {
  @PrimaryKey
  @ForeignKey(() => require('./hotel.model').Hotel)
  @Column(DataType.STRING(20))
  hotel_id!: string;

  @PrimaryKey
  @ForeignKey(() => require('./highlight.model').Highlight)
  @Column(DataType.STRING(20))
  highlight_id!: string;

  @Column(DataType.STRING(255))
  custom_text!: string | null;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.DATE)
  created_at!: Date;

  // Associations
  @BelongsTo(() => require('./hotel.model').Hotel)
  hotel!: any;

  @BelongsTo(() => require('./highlight.model').Highlight)
  highlight!: any;
}
