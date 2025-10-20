export function mapSortToSQL(sort?: string): string {
  switch (sort) {
    case "price_desc":
      return " ORDER BY total_price DESC ";
    case "star_desc":
      return " ORDER BY h.star_rating DESC, total_price ASC ";
    case "distance_asc":
      return " ORDER BY hl.distance_center ASC, total_price ASC ";
    case "rating_desc":
      return " ORDER BY h.avg_rating DESC, total_price ASC ";
    case "price_asc":
    default:
      return " ORDER BY total_price ASC ";
  }
}
