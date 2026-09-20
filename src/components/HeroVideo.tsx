import Image from "next/image";

export default function HeroVideo() {
  return <Image src="/images/sturdi-girl.png" alt="Sturdi Girl, the SturdiHome guide" width={900} height={900} priority className="absolute inset-0 h-full w-full object-contain max-sm:relative max-sm:h-auto" />;
}
