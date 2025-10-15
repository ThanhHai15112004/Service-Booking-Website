export const formatDate = (date: Date, isDayUse: boolean = false): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  
  if (isDayUse) {
    return `${date.getDate()} tháng ${date.getMonth() + 1} ${date.getFullYear()}\n${dayName} | Trả phòng trong ngày`;
  }
  
  return `${date.getDate()} tháng ${date.getMonth() + 1} ${date.getFullYear()}\n${dayName}`;
};

export const getGuestSummary = (adults: number, children: number, rooms: number): string => {
  let summary = `${adults} người lớn`;
  if (children > 0) {
    summary += `, ${children} trẻ em`;
  }
  summary += `, ${rooms} phòng`;
  return summary;
};

export const generateCalendar = (currentCalendarMonth: Date) => {
  const currentMonth = currentCalendarMonth.getMonth();
  const currentYear = currentCalendarMonth.getFullYear();
  
  return {
    currentMonth: {
      month: currentMonth,
      year: currentYear,
      firstDay: new Date(currentYear, currentMonth, 1).getDay(),
      daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate()
    },
    nextMonth: {
      month: currentMonth + 1 > 11 ? 0 : currentMonth + 1,
      year: currentMonth + 1 > 11 ? currentYear + 1 : currentYear,
      firstDay: new Date(currentYear, currentMonth + 1, 1).getDay(),
      daysInMonth: new Date(currentYear, currentMonth + 2, 0).getDate()
    }
  };
};