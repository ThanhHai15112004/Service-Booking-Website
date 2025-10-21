import { off } from 'process';
import { Request, Response } from "express";
import { clamp, parseChildAges, parseStringArr, toFloat, toInt } from "../../helpers/convertValue.helper";
import { Hotel, HotelSearchParams } from '../../models/hotel.model';
import { searchHotelsOvernight, searchHotelsDayuse } from '../../services/HotelModules/searchHotel.service';


export async function getHotelSearchController(req: Request, res: Response) {
    try {
        // Get query parameters
        const stayTypeRaw = String (req.query.stayType || "overnight").toLocaleLowerCase();
        const stayType = (stayTypeRaw === "dayuse" ? "dayuse" : "overnight") as "dayuse" | "overnight";

        const q = String(req.query.q || "").slice(0, 120);

        const rooms = clamp(toInt(req.query.rooms, 1), 1, 50);
        const adults = clamp(toInt(req.query.adults, 1), 1, 100);
        const children = clamp(toInt(req.query.children, 0), 0, 100);
        const childAges = parseChildAges(req.query.childAges);

        //overnight: checkin, checkout; dayuse: date
        const checkin = req.query.checkin ? String(req.query.checkin) : undefined;
        const checkout = req.query.checkout ? String(req.query.checkout) : undefined;
        
        const date = req.query.date ? String(req.query.date) : undefined;

        // filter
        let price_min = toFloat(req.query.price_min, 0);
        let price_max = toFloat(req.query.price_max, 999999999);
        if (price_max < price_min) [price_min, price_max] = [price_max, price_min];

        const star_min = clamp(toFloat(req.query.star_min, 0), 0, 5);
        const max_distance = clamp(toFloat(req.query.max_distance, 9999), 0, 999);

        const facilities = parseStringArr(req.query.facilities).slice(0, 50);

        const sortAllow = new Set([
            "price_asc",
            "price_desc",
            "star_desc",
            "rating_desc",
            "distance_asc",
        ]);
        const sort = sortAllow.has(String(req.query.sort)) ? (req.query.sort as any) : "price_asc";

       
        const limit = clamp(toInt(req.query.limit, 20), 1, 100);
        const offset = clamp(toInt(req.query.offset, 0), 0, 1_000_000);

        // đóng gói params
        const params: HotelSearchParams = {
            stayType,
            q,
            checkin,
            checkout,
            date,
            rooms,
            adults,
            children,
            childAges,
            price_min,
            price_max,
            star_min,
            facilities,
            max_distance,
            limit,
            offset,
            sort,
        };

        // gọi service
        let result;

        if (params.stayType === "overnight") {
        result = await searchHotelsOvernight(params);
        } else if (params.stayType === "dayuse") {
        result = await searchHotelsDayuse(params);
        } else {
        result = { success: false, items: [], message: "Invalid stayType" };
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error("getHotelSearchController error:", err);
        return res.status(500).json({
        success: false,
        items: [],
        message: "Lỗi server khi tìm kiếm khách sạn",
        });
    }
}

function searchHotelsDayUse(params: HotelSearchParams): any {
    throw new Error('Function not implemented.');
}
