import Image from "next/image";
export function RoofReference() {
  return (
    <figure className="roof-reference">
      <a href="/assets/roof-system-enhanced.png" target="_blank" rel="noopener noreferrer" aria-label="Open the enhanced roof-system illustration at full resolution">
        <Image src="/assets/roof-system-enhanced.png" alt="Enhanced Owens Corning roof-system illustration showing separated layers: intake ventilation, water barrier, underlayment, starter shingles, field shingles, exhaust ventilation and ridge caps, above timber framing and attic insulation." width={1656} height={950} unoptimized />
      </a>
      <figcaption>AI-enhanced version of the supplied Owens Corning roof-system reference illustration, for general education rather than installation guidance. Product names shown are not confirmation of WeRoof’s installed products. Your written estimate defines the materials and components included; this illustration does not define the $2,999 offer.</figcaption>
      <a className="text-link" href="/assets/roof-system-enhanced.png" target="_blank" rel="noopener noreferrer">View clear image</a>{" · "}
      <a className="text-link" href="/assets/roof-system-reference.png" target="_blank" rel="noopener noreferrer">View original image</a>
    </figure>
  );
}
