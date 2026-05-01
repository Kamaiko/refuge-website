export type JournalEntry = {
  slug: string;
  date: string;
  saison: string;
  titre: string;
  texte: string;
};

export const JOURNAL: JournalEntry[] = [
  {
    slug: "biche-octobre",
    date: "12 octobre 2026",
    saison: "Automne",
    titre: "Le matin, il y avait une biche.",
    texte:
      "Six heures et quelques. Elle est restée trois minutes près du sauna, puis elle a continué. C’est tout ce qui s’est passé. C’était assez.",
  },
  {
    slug: "fjord-juillet",
    date: "23 juillet 2026",
    saison: "Été",
    titre: "Trois bélugas sont passés en file.",
    texte:
      "On peignait la terrasse de Galets. Un voisin de la baie a crié. On a tout lâché pour les regarder remonter le fleuve sans se retourner.",
  },
  {
    slug: "premiere-neige",
    date: "16 novembre 2025",
    saison: "Avant-hiver",
    titre: "Première neige sur Brume.",
    texte:
      "Pas plus de trois centimètres. Elle a tenu jusqu’à dix heures, puis le soleil a tout effacé. La terrasse, après, sentait à nouveau le bois mouillé.",
  },
];
