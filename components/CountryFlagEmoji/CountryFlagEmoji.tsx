interface Props {
  country: string;
}

export function CountryFlagEmoji({ country }: Props) {
  switch (country) {
    case "argentina":
      return "🇦🇷";
    case "peru":
      return "🇵🇪";
    case "colombia":
      return "🇨🇴";
    default:
      return null;
  }
}
