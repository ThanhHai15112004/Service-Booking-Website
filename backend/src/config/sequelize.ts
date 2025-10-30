import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

// Hotel Module Models
import { BedType } from '../models/Hotel/bedType.model';
import { Category } from '../models/Hotel/category.model';
import { Facility } from '../models/Hotel/facility.model';
import { PolicyType } from '../models/Hotel/policy.model';
import { Location } from '../models/Hotel/location.model';
import { Hotel } from '../models/Hotel/hotel.model';
import { HotelImage } from '../models/Hotel/hotelImage.model';
import { HotelFacility } from '../models/Hotel/hotelFacility.model';
import { RoomType } from '../models/Hotel/roomType.model';
import { Room } from '../models/Hotel/room.model';
import { RoomPolicy } from '../models/Hotel/roomPolicy.model';
import { RoomPriceSchedule } from '../models/Hotel/roomPriceSchedule.model';
import { RoomImage } from '../models/Hotel/roomImage.model';
import { RoomAmenity } from '../models/Hotel/roomAmenity.model';


dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'booking_database',
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  timezone: '+07:00',
  
  define: {
    timestamps: false,
    underscored: true, 
    freezeTableName: true 
  }
});

// Đăng ký models theo module
const hotelModels = [
  // Metadata models
  BedType,
  Category,
  Facility,
  PolicyType,

  // Core models
  Location,
  Hotel,
  HotelImage,
  HotelFacility,
  RoomType,
  Room,
  RoomPolicy,
  RoomPriceSchedule,
  RoomImage,
  RoomAmenity
];


sequelize.addModels([
  ...hotelModels,
]);

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database via Sequelize:', error);
    process.exit(1);
  }
};

export default sequelize;

