import cron from "node-cron";

export function startAutoGeneratePricesJob(): void {
  console.log(`⏱️ Cron job auto-generate prices đã tạm thời bị vô hiệu hóa (PriceAutoGenerationService chưa được implement).`);

}
export async function testAutoGeneratePrices() {
  console.log(`[Test] Testing auto-generate prices...`);
  console.log(`⚠️ TEMPORARILY DISABLED: PriceAutoGenerationService chưa được implement`);
  
  
  return { success: false, message: "PriceAutoGenerationService chưa được implement" };
}

