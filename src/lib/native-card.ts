import { registerPlugin } from "@capacitor/core";
const VibeCard = registerPlugin<{ saveImage(options: { data: string; fileName: string }): Promise<{ uri: string }> }>("VibeCard");
export async function saveNativeCard(dataUrl: string) {
  return VibeCard.saveImage({ data: dataUrl.split(",")[1], fileName: `r-we-vibing-${Date.now()}.png` });
}
