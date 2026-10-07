import { StaticImageData } from "next/image";
import roundImg from "@/public/round.png";
import ovalImg from "@/public/oval.png";
import emeraldImg from "@/public/emerald.png";
import princessImg from "@/public/princess.png";
import pearImg from "@/public/pear.png";
import cushionImg from "@/public/cushion.png";
import marquiseImg from "@/public/marquise.png";
import radiantImg from "@/public/radiant.png";
import asscherImg from "@/public/asscher.png";
import heartImg from "@/public/heart.png";

export const diamondImagesMap: Record<string, StaticImageData> = {
  round: roundImg,
  oval: ovalImg,
  emerald: emeraldImg,
  princess: princessImg,
  pear: pearImg,
  cushion: cushionImg,
  marquise: marquiseImg,
  radiant: radiantImg,
  asscher: asscherImg,
  heart: heartImg,
};

export function getDiamondImage(shape: string): StaticImageData {
  const key = shape.toLowerCase();
  return diamondImagesMap[key] || roundImg;
}
