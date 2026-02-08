export type Comestibilidad = "comestible" | "tóxica" | "sin interés" | "desconocida";

export type Mushroom = {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  comestibilidad: Comestibilidad;
  habitat: string[];
  epoca: string[];
  rasgos: string[];
  descripcionCorta: string;
  /** Nombres de setas con las que no hay que confundirla (común o científica) */
  confusiones?: string[];
  precauciones?: string[];
  imagenes: Array<{
    src: string;
    alt: string;
  }>;
};

export const MUSHROOMS: Mushroom[] = [
  {
    id: "amanita-muscaria",
    nombreComun: "Matamoscas",
    nombreCientifico: "Amanita muscaria",
    comestibilidad: "tóxica",
    habitat: ["coníferas", "abedules", "bosque"],
    epoca: ["otoño"],
    rasgos: ["sombrero rojo con verrugas blancas", "láminas blancas", "anillo", "base bulbosa"],
    descripcionCorta: "Muy llamativa. Tóxica. A menudo asociada a coníferas y abedules.",
    confusiones: ["Amanita caesarea (comestible, sombrero naranja sin verrugas blancas)", "Amanita phalloides (mortal, sombrero verde/blanco)"],
    precauciones: ["No consumir. Puede causar intoxicación grave."],
    imagenes: [
      { src: "/images/amanita-muscaria/01.jpg", alt: "Amanita muscaria en el bosque" },
      { src: "/images/amanita-muscaria/02.jpg", alt: "Detalle del sombrero de Amanita muscaria" }
    ]
  },
  {
    id: "boletus-edulis",
    nombreComun: "Boleto / Cep",
    nombreCientifico: "Boletus edulis",
    comestibilidad: "comestible",
    habitat: ["pinares", "robledales", "bosque"],
    epoca: ["otoño", "finales de verano"],
    rasgos: ["tubos/poros (no láminas)", "pie robusto", "carne blanca"],
    descripcionCorta: "Excelente comestible. Ojo con confusiones con boletos amargos o tóxicos.",
    confusiones: ["Boletus satanas (tóxico, pie rojizo, poros rojos)", "Tylopilus felleus (amargo, no comestible)"],
    precauciones: ["Asegura identificación. Evita ejemplares muy maduros."],
    imagenes: [{ src: "/images/boletus-edulis/01.jpeg", alt: "Boleto sobre hojarasca" }]
  },
  {
    id: "lactarius-deliciosus",
    nombreComun: "Níscalo",
    nombreCientifico: "Lactarius deliciosus",
    comestibilidad: "comestible",
    habitat: ["pinares"],
    epoca: ["otoño"],
    rasgos: ["látex naranja", "sombrero anaranjado con círculos", "verdín al manipular"],
    descripcionCorta: "Muy típico en pinares. El látex naranja es una buena pista.",
    confusiones: ["Lactarius torminosus (tóxico, látex blanco, sombrero con vello)", "Otros Lactarius con látex no naranja"],
    imagenes: [
      { src: "https://placehold.co/400x300/8b6919/d4e8b0?text=N%C3%ADscalo", alt: "Níscalo en pinar" }
    ]
  },
  {
    id: "amanita-phalloides",
    nombreComun: "Oronja verde / Cicuta verde",
    nombreCientifico: "Amanita phalloides",
    comestibilidad: "tóxica",
    habitat: ["bosque", "robledales", "alcornoques", "encinares"],
    epoca: ["otoño", "finales de verano"],
    rasgos: ["sombrero verde a blanquecino", "láminas blancas", "anillo", "volva en saco"],
    descripcionCorta: "Mortal. La intoxicación más grave en España. Nunca consumir.",
    confusiones: ["Amanita caesarea (comestible, sombrero naranja)", "Agaricus (láminas rosadas que pasan a marrón)"],
    precauciones: ["Setas mortales. Una sola puede ser letal. Ante duda, no consumir."],
    imagenes: [
      { src: "https://placehold.co/400x300/3d5c2e/c8e6b8?text=Amanita+phalloides", alt: "Oronja verde" },
      { src: "https://placehold.co/400x300/2a4a24/a8d498?text=Detalle+volva", alt: "Detalle base" }
    ]
  },
  {
    id: "cantharellus-cibarius",
    nombreComun: "Rebozuelo / Seta de San Juan",
    nombreCientifico: "Cantharellus cibarius",
    comestibilidad: "comestible",
    habitat: ["bosque", "pinares", "hayas", "alcornoques"],
    epoca: ["verano", "otoño"],
    rasgos: ["sombrero amarillo huevo", "falsas láminas en pliegues", "olor afrutado", "no tiene láminas verdaderas"],
    descripcionCorta: "Muy apreciada. Crece en grupos. Olor característico a albaricoque.",
    confusiones: ["Hygrophoropsis aurantiaca (falsa seta de caballo, láminas más naranjas)", "Omphalotus (tóxico, láminas bien marcadas)"],
    imagenes: [
      { src: "https://placehold.co/400x300/c9a227/2d2610?text=Rebozuelo", alt: "Rebozuelo" },
      { src: "https://placehold.co/400x300/e0b840/3d3518?text=Grupo+rebozuelos", alt: "Grupo" }
    ]
  },
  {
    id: "amanita-caesarea",
    nombreComun: "Oronja / Amanita de los césares",
    nombreCientifico: "Amanita caesarea",
    comestibilidad: "comestible",
    habitat: ["alcornoques", "encinas", "castaños", "bosque mediterráneo"],
    epoca: ["verano", "otoño"],
    rasgos: ["sombrero naranja sin verrugas", "láminas y pie amarillos", "anillo colgante", "volva blanca en saco"],
    descripcionCorta: "Excelente comestible. Solo confundir con otras amanitas; la oronja verde es mortal.",
    confusiones: ["Amanita muscaria (tóxica, sombrero con verrugas blancas)", "Amanita phalloides (mortal, sombrero verde/blanco)"],
    precauciones: ["Identificación segura. No consumir si hay duda con amanitas tóxicas."],
    imagenes: [
      { src: "https://placehold.co/400x300/d4750c/2d1a06?text=Oronja", alt: "Amanita caesarea" }
    ]
  },
  {
    id: "calocybe-gambosa",
    nombreComun: "Perrechico / Seta de San Jorge",
    nombreCientifico: "Calocybe gambosa",
    comestibilidad: "comestible",
    habitat: ["prados", "bordes de bosque", "claros"],
    epoca: ["primavera"],
    rasgos: ["sombrero blanco a crema", "láminas blancas muy apretadas", "olor harinoso", "carne blanca"],
    descripcionCorta: "Muy buscada en primavera. Crece en círculos o grupos. Olor característico.",
    confusiones: ["Entoloma lividum (tóxico, láminas rosadas en madurez)", "Clitocybe (algunas tóxicas)"],
    imagenes: [
      { src: "https://placehold.co/400x300/e8e0c8/4a4840?text=Perrechico", alt: "Perrechico" }
    ]
  },
  {
    id: "macrolepiota-procera",
    nombreComun: "Parasol / Galamperna",
    nombreCientifico: "Macrolepiota procera",
    comestibilidad: "comestible",
    habitat: ["claros", "bordes de bosque", "prados"],
    epoca: ["otoño", "verano"],
    rasgos: ["sombrero grande con escamas marrones", "anillo doble móvil", "pie con dibujo de serpiente"],
    descripcionCorta: "Solo el sombrero se consume (pie fibroso). Muy apreciada.",
    confusiones: ["Lepiota venenosa (más pequeña, anillo no móvil)", "Chlorophyllum molybdites (esporas verdes)"],
    imagenes: [
      { src: "https://placehold.co/400x300/6b5344/d4c8b8?text=Parasol", alt: "Parasol" }
    ]
  }
];

export const COMESTIBILIDAD_OPTIONS: readonly Comestibilidad[] = [
  "comestible",
  "tóxica",
  "sin interés",
  "desconocida"
] as const;

export function getMushroomById(id: string): Mushroom | undefined {
  return MUSHROOMS.find((m) => m.id === id);
}
