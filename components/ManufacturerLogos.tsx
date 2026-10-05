import Image from "next/image";
import styles from "./ManufacturerLogos.module.css";

const brands = [
  { name: "GAF", file: "gaf.svg", width: 168, height: 100, className: styles.gaf },
  { name: "Owens Corning", file: "owens-corning.svg", width: 1555, height: 1563, className: styles.owens },
  { name: "CertainTeed", file: "certainteed.svg", width: 286, height: 66, className: styles.certainteed },
  { name: "Boral Steel", file: "boral-steel.png", width: 1161, height: 338, className: styles.boral },
];

export function ManufacturerLogos() {
  return (
    <section className={styles.section} aria-labelledby="roofing-brands-title">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.intro}>
          <h2 id="roofing-brands-title">Roofing brands</h2>
          <p>Ask about product options for your home.</p>
        </div>
        <ul className={styles.logos} role="list">
          {brands.map((brand) => (
            <li key={brand.name}>
              <Image
                src={`/assets/brands/${brand.file}`}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                className={brand.className}
                unoptimized
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
