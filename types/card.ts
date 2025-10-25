export type CardType = "gold" | "silver" | "bronze";
export type Sport = "golf" | "tennis" | "soccer" | "basball";
export type Card = {
  id?: string | number;
  type: CardType;
  country: string;
  sport: Sport;
  name: string;
  source: string;
  image: string;
  metadata?: {
    age: number;
    bio: string;
    profileUrl: string | null;
    latestResults: {
      tournament: string;
      category: string | null;
      result: string;
      awardAmount: number | null;
      date: string;
    }[];
  };
};
