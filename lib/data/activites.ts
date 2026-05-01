export type Activite = {
  slug: string;
  nom: string;
  duree: string;
  intensite: "Douce" | "Moyenne" | "Soutenue";
  description: string;
  image: string;
};

export const ACTIVITES: Activite[] = [
  {
    slug: "kayak-fjord",
    nom: "Kayak sur le fjord",
    duree: "3 h",
    intensite: "Moyenne",
    description: "Embarquement à Baie-Saint-Paul ou à Pointe-au-Pic, selon la marée.",
    image: "/images/activite-kayak.jpg",
  },
  {
    slug: "marche-foret",
    nom: "Marche en forêt boréale",
    duree: "2 à 4 h",
    intensite: "Douce",
    description: "Sentiers tracés autour des refuges, jusqu’aux belvédères du fleuve.",
    image: "/images/activite-marche.jpg",
  },
  {
    slug: "sauna-crepuscule",
    nom: "Sauna nordique au crépuscule",
    duree: "1 h 30",
    intensite: "Douce",
    description: "Cycle chaud-froid traditionnel. Inclus avec chaque refuge.",
    image: "/images/activite-sauna.jpg",
  },
  {
    slug: "observation-baleines",
    nom: "Observation des baleines",
    duree: "Demi-journée",
    intensite: "Douce",
    description: "Saison de mai à octobre, départ de Tadoussac.",
    image: "/images/activite-baleines.jpg",
  },
  {
    slug: "table-saison",
    nom: "Table d’hôte saisonnière",
    duree: "Soirée",
    intensite: "Douce",
    description: "Cuisine du terroir, sur réservation, livrée au refuge.",
    image: "/images/activite-table.jpg",
  },
  {
    slug: "veillee-foyer",
    nom: "Veillée au foyer",
    duree: "Libre",
    intensite: "Douce",
    description: "Bois fendu fourni. Le ciel, parfois, fait le reste.",
    image: "/images/activite-foyer.jpg",
  },
];
