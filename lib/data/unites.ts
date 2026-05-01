export type Unite = {
  slug: string;
  nom: string;
  surnom: string;
  positionnement: string;
  description: string;
  capacite: string;
  surface: string;
  particularite: string;
  image: string;
};

export const UNITES: Unite[] = [
  {
    slug: "aubepine",
    nom: "Aubépine",
    surnom: "Au creux de la forêt",
    positionnement:
      "Au cœur de la forêt boréale, à six minutes de marche du chemin.",
    description:
      "Le plus enclavé des trois. Aucun voisin, aucune vue ouverte ; seulement les arbres, le bois noir et le silence. Pour celles et ceux qui viennent vraiment écouter.",
    capacite: "2 personnes",
    surface: "32 m²",
    particularite: "Sauna nordique extérieur",
    image: "/images/unite-aubepine.avif",
  },
  {
    slug: "galets",
    nom: "Galets",
    surnom: "Au bord du fleuve",
    positionnement:
      "À une dizaine de mètres de la grève. Les marées montent et redescendent sous la fenêtre.",
    description:
      "Le refuge le plus exposé. La marée, le vent, la lumière qui change toute la journée. Les bélugas passent l’été, parfois.",
    capacite: "2-3 personnes",
    surface: "38 m²",
    particularite: "Bain à remous extérieur face au fleuve",
    image: "/images/unite-galets.avif",
  },
  {
    slug: "brume",
    nom: "Brume",
    surnom: "Sur le promontoire",
    positionnement:
      "Sur la pointe rocheuse. Vue dégagée sur quarante kilomètres de fleuve.",
    description:
      "Le plus haut, le plus exposé au ciel. Aux premières heures, la brume s’élève du fleuve et passe sous le refuge. Aurores boréales possibles l’hiver.",
    capacite: "2-4 personnes",
    surface: "46 m²",
    particularite: "Foyer extérieur sur terrasse panoramique",
    image: "/images/unite-brume.avif",
  },
];
