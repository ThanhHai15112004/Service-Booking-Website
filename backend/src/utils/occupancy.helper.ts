export type OccupancyMode = "adults_only" | "adults_plus_children";

export interface OccupancyInput {
  rooms: number;
  adults: number;
  children?: number;
  childAges?: number[];
  mode?: OccupancyMode;          // default: "adults_only"
  freeChildAgeLimit?: number;    // default 6
  adultAgeThreshold?: number;    // default 12
}

export function computeRequiredPerRoom(input: OccupancyInput) {
  const {
    rooms, adults, children = 0, childAges = [],
    mode = "adults_only",
    freeChildAgeLimit = 6,
    adultAgeThreshold = 12,
  } = input;

  if (!rooms || rooms < 1) throw new Error("rooms must be >= 1");
  if (!adults || adults < 1) throw new Error("adults must be >= 1");

  let effective = adults;

  if (mode === "adults_plus_children") {
    for (const age of childAges.slice(0, children)) {
      if (age >= adultAgeThreshold) effective += 1;
      else if (age >= freeChildAgeLimit) effective += 1; 
    }
  }
  return { requiredPerRoom: Math.ceil(effective / rooms), effectiveGuests: effective };
}

export interface ChildrenPolicy {
  childrenAllowed: boolean;
  freeChildAgeLimit: number;     // < limit: miễn phí
  adultAgeThreshold: number;     // >= threshold: như người lớn
  extraBedFee: number;           // phí/đêm cho 1 trẻ tính phí
}

export function evaluateChildrenPolicy(childAges: number[], policy: ChildrenPolicy, nights: number) {
  if (!policy.childrenAllowed && childAges.length > 0) {
    return {
      allowed: false,
      chargeableChildren: 0,
      freeChildren: 0,
      extraFeePerNight: 0,
      extraFeeTotal: 0,
      reason: "Children not allowed for this room",
    };
  }

  let freeChildren = 0;
  let chargeableChildren = 0;

  for (const age of childAges) {
    if (age < policy.freeChildAgeLimit) {
      freeChildren += 1;                 // miễn phí
    } else if (age >= policy.adultAgeThreshold) {
      // thường Agoda tính như người lớn (giá phòng), ở đây vẫn coi là trẻ tính phí/giường phụ
      chargeableChildren += 1;
    } else {
      // khoảng giữa: trẻ tính phí
      chargeableChildren += 1;
    }
  }

  const extraFeePerNight = chargeableChildren * (policy.extraBedFee ?? 0);
  const extraFeeTotal = extraFeePerNight * nights;

  return {
    allowed: true,
    freeChildren,
    chargeableChildren,
    extraFeePerNight,
    extraFeeTotal,
  };
}