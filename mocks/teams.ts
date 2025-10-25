import { Team, TeamStatus } from "types/team";

export const mockResults = [
  {
    result: "Round 16",
    date: "2024-12-04T00:00:00-03:00",
    tournament: "J30 Luque",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_jUguOXs.jpeg",
    category: "ITF Junior",
    awardAmount: null,
  },
  {
    result: "Round 16",
    date: "2024-12-03T00:00:00-03:00",
    tournament: "J30 Luque",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_jUguOXs.jpeg",
    category: "ITF Junior",
    tournament_type: 2,
    awardAmount: null,
  },
  {
    result: "Round 16",
    date: "2024-10-01T00:00:00-03:00",
    tournament: "J200 Salta",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_YalJSKo.jpeg",
    category: "ITF Junior",
    tournament_type: 2,
    awardAmount: null,
  },
  {
    result: "Round 32",
    date: "2024-09-30T00:00:00-03:00",
    tournament: "J200 Salta",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_YalJSKo.jpeg",
    category: "ITF Junior",
    awardAmount: null,
  },
  {
    result: "Quarter - finalist",
    date: "2024-09-26T00:00:00-03:00",
    tournament: "J200 Punta del Este",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_eObHllM.jpeg",
    category: "ITF Junior",
    awardAmount: null,
  },
  {
    result: "Winner",
    date: "2024-09-15T00:00:00-03:00",
    tournament: "J30 Santiago Del Estero",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_JRgpvd9.jpeg",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "Round 16",
    date: "2024-08-21T00:00:00-03:00",
    tournament: "J60 Villa Maria",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_bOVKBF3.jpeg",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "Round 16",
    date: "2024-08-13T00:00:00-03:00",
    tournament: "J60 Villa Maria",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_bOVKBF3.jpeg",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "Round 32",
    date: "2024-06-25T00:00:00-03:00",
    tournament: "J30 Salta",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_HQgG94R.jpeg",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "Quarter - finalist",
    date: "2024-05-31T00:00:00-03:00",
    tournament: "J30 Buenos Aires",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_D1rJexY.jpeg",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "Winner",
    date: "2024-04-21T00:00:00-03:00",
    tournament: "2° Regional - Region 5",
    tournamentImageUrl: "",
    category: "AAT Junior",
    tournament_type: 2,
    awardAmount: null,
  },
  {
    result: "Winner",
    date: "2024-04-21T00:00:00-03:00",
    tournament: "2° Regional - Region 5",
    tournamentImageUrl: "",
    category: "AAT Junior",
    awardAmount: null,
  },
  {
    result: "Qualifier 1",
    date: "2024-04-14T00:00:00-03:00",
    tournament: "Challenger Tucuman",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/Challenger_tour_3y0TKJJ.png",
    category: "Challenger",
    awardAmount: 130.0,
  },
  {
    result: "Round 16",
    date: "2024-03-20T00:00:00-03:00",
    tournament: "J100 Mendoza",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_Junior_g9Nvlr3.jpeg",
    category: "ITF Junior",
    awardAmount: null,
  },
  {
    result: "Round 64",
    date: "2024-03-12T00:00:00-03:00",
    tournament: "1er Nacional - Mendoza",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/AAT_aamj30B.jpeg",
    category: "National junior",
    awardAmount: null,
  },
  {
    result: "Qualifier 1",
    date: "2024-02-25T00:00:00-03:00",
    tournament: "M25 Tucuman",
    tournamentImageUrl:
      "https://slicetokenbackendassets.s3.amazonaws.com/media/tournaments/ITF_World_r8hsGXP.webp",
    category: "ITF",
    awardAmount: null,
  },
  {
    result: "-",
    date: "2023-06-20T21:00:00-03:00",
    tournament: "Pro Tour",
    tournamentImageUrl: "",
    category: null,
    awardAmount: 21.3,
  },
];

export const mockTeams: Team[] = [
  {
    id: "1",
    cards: [
      {
        type: "bronze",
        country: "argentina",
        name: "José Fernández",
        image: "jose_fernandez.png",
        source: "slicetoken.io",
        sport: "tennis",
        metadata: {
          age: 16,
          bio: "José Fernández, nacido el 6 de mayo de 2008 en La Banda, Santiago del Estero, Argentina, es un joven talento en ascenso en el tenis argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los siete años en el Santiago Lawn Tenis Club, donde rápidamente demostró un notable talento para el deporte. Desde sus primeros días en el club, José mostró una gran pasión y habilidad para el tenis. Gracias a su dedicación y a la guía de sus entrenadores, desarrolló una técnica sólida y un estilo de juego agresivo que lo destacaron entre sus compañeros. A los 14 años, alcanzó el puesto número 2 del ranking nacional argentino sub-14, un logro significativo que evidenció su potencial. En 2022, José representó a Argentina en el Mundial Sub-14 en la República Checa, compitiendo contra algunos de los mejores jóvenes tenistas del mundo. Su participación en este evento internacional no sólo elevó su perfil, sino que también le brindó una valiosa experiencia competitiva. Además, ha representado a su país en diversos torneos sudamericanos, demostrando orgullo y compromiso en cada encuentro. Fuera de las competencias, José se dedica intensamente a su entrenamiento, trabajando para mejorar continuamente su juego. Mantiene un equilibrio saludable entre su carrera deportiva y su vida personal, disfrutando de tiempo con su familia y amigos, así como de otras actividades deportivas y recreativas. Con una carrera en pleno desarrollo y una notable trayectoria en el ámbito juvenil, José Fernández promete ser una figura importante en el tenis argentino en los próximos años.",
          latestResults: mockResults,
          profileUrl:
            "https://www.itftennis.com/en/players/jose-gabriel-fernandez/800654739/arg/jt/s/overview/",
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Fabrizio Mazzocchetti",
        source: "slicetoken.io",
        sport: "tennis",
        image: "fabrizio_mazzocchetti.png",
        metadata: {
          age: 16,
          bio: "Fabrizio Mazzocchetti, nacido el 24 de agosto de 2008 en Ciudad Evita, Argentina, es un talentoso joven tenista argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los cinco años en el Oasis Tennis Club. En 2022, Fabrizio logró un importante hito en su carrera al ganar el torneo COSAT Internacional Copa El Ceibo en la categoría sub-14, tanto en singles como en dobles. Este triunfo resaltó su habilidad y potencial en el tenis juvenil. Fabrizio se distingue por su dedicación y enfoque en mejorar su juego. Continúa entrenando intensamente para seguir avanzando en su carrera y representar a Argentina en futuros torneos internacionales. Con un prometedor inicio en el tenis, Fabrizio es una joven promesa que apunta a dejar una marca significativa en el tenis argentino.",
          latestResults: mockResults,
          profileUrl: null,
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Jaime López Rivarola",
        source: "slicetoken.io",
        sport: "golf",
        image: "jaime_lopez_rivarola.png",
        metadata: {
          age: 29,
          bio: "Jaime López Rivarola, nacido el 7 de febrero de 1995 en Buenos Aires, Argentina, es un golfista argentino. Comenzó su carrera en el golf a los 12 años en el Club Universitario de Buenos Aires, donde desarrolló su pasión por el deporte. Representó a Argentina en numerosas competencias a nivel amateur, incluyendo sudamericanos y campeonatos mundiales. Su dedicación y habilidad en el golf le valieron para integrar el equipo de golf de la Universidad de Georgia, donde se graduó como Licenciado en Economía. Después de finalizar sus estudios universitarios, López Rivarola dio el salto al profesionalismo en 2018. En 2022, logró un importante hito al ganar el Abierto de Brasil, un torneo perteneciente al PGA Tour Latinoamérica. Con una combinación única de talento deportivo y logros académicos, Jaime López Rivarola continúa dejando su marca en el mundo del golf argentino y profesional.",
          latestResults: mockResults,
          profileUrl:
            "https://www.pgatour.com/es/latinoamerica/player/39000/jaime-lopez-rivarola",
        },
      },
      {
        type: "silver",
        country: "peru",
        name: "Juan Pablo Varillas",
        source: "slicetoken.io",
        sport: "tennis",
        image: "juan_pablo_varillas.png",
        metadata: {
          age: 29,
          bio: "Juan Pablo Varillas nació el 6 de octubre de 1995 en Lima, Perú. Es un tenista profesional peruano conocido por su desempeño en canchas de arcilla. Comenzó a jugar tenis a los cinco años en el club donde sus padres eran socios. Durante su carrera, Varillas ha ganado varios títulos en el circuito ATP Challenger y ha alcanzado un ranking ATP en individuales de 60, el más alto de su carrera, en junio de 2023. Ese mismo año, hizo historia al llegar a la cuarta ronda de Roland Garros, siendo el primer peruano en alcanzar esta etapa en un Grand Slam en 29 años. En el mismo torneo, derrotó al 13º sembrado Hubert Hurkacz en un emocionante partido a cinco sets. En 2016, estuvo a punto de retirarse debido a una falta de resultados y confianza, pero el apoyo de su familia y entrenadores lo motivó a seguir adelante. Su ídolo es Rafael Nadal, quien lo inspiró a seguir esforzándose en el deporte. En su vida personal, Varillas disfruta del fútbol y es seguidor del Real Madrid. Le encanta la comida peruana, especialmente el ceviche.",
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/es/players/juan-pablo-varillas-/v836/overview",
        },
      },
      {
        type: "gold",
        country: "argentina",
        name: "Tomás Martín Etcheverry",
        source: "slicetoken.io",
        sport: "tennis",
        image: "tomas_martin_etcheverry.png",
        metadata: {
          age: 25,
          bio: 'Tomás Martín Etcheverry, nacido el 18 de julio de 1999 en La Plata, Argentina, es un destacado tenista argentino conocido por su potente saque y habilidades en canchas de arcilla. Con una altura de 1.96 metros, comenzó a jugar tenis a los cinco años gracias a sus padres, quienes le regalaron un "palo con pelota" durante unas vacaciones familiares. Desde entonces, su dedicación y ética de trabajo lo han impulsado a destacar en el deporte, inspirándose en jugadores como Novak Djokovic y Juan Martín del Potro. En su carrera junior, llegó a ser el número 12 del mundo, y como profesional, alcanzó el top 200 en junio de 2021 y el top 100 en abril de 2022. Su mejor ranking hasta la fecha es el número 27, logrado en febrero de 2024. El año 2023 fue especialmente destacado, llegando a los cuartos de final de Roland Garros y alcanzando las finales del ATP en Santiago y Houston. Este joven tenista continúa siendo una figura prominente en el tenis argentino y mundial, con grandes expectativas para futuros torneos y una prometedora carrera por delante.',
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/en/players/tomas-martin-etcheverry/ea24/overview",
        },
      },
    ],
    profit: 100.0,
    status: TeamStatus.ON_FIELD,
  },
  {
    id: "2",
    cards: [
      {
        type: "bronze",
        country: "argentina",
        name: "José Fernández",
        image: "jose_fernandez.png",
        source: "slicetoken.io",
        sport: "tennis",
        metadata: {
          age: 16,
          bio: "José Fernández, nacido el 6 de mayo de 2008 en La Banda, Santiago del Estero, Argentina, es un joven talento en ascenso en el tenis argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los siete años en el Santiago Lawn Tenis Club, donde rápidamente demostró un notable talento para el deporte. Desde sus primeros días en el club, José mostró una gran pasión y habilidad para el tenis. Gracias a su dedicación y a la guía de sus entrenadores, desarrolló una técnica sólida y un estilo de juego agresivo que lo destacaron entre sus compañeros. A los 14 años, alcanzó el puesto número 2 del ranking nacional argentino sub-14, un logro significativo que evidenció su potencial. En 2022, José representó a Argentina en el Mundial Sub-14 en la República Checa, compitiendo contra algunos de los mejores jóvenes tenistas del mundo. Su participación en este evento internacional no sólo elevó su perfil, sino que también le brindó una valiosa experiencia competitiva. Además, ha representado a su país en diversos torneos sudamericanos, demostrando orgullo y compromiso en cada encuentro. Fuera de las competencias, José se dedica intensamente a su entrenamiento, trabajando para mejorar continuamente su juego. Mantiene un equilibrio saludable entre su carrera deportiva y su vida personal, disfrutando de tiempo con su familia y amigos, así como de otras actividades deportivas y recreativas. Con una carrera en pleno desarrollo y una notable trayectoria en el ámbito juvenil, José Fernández promete ser una figura importante en el tenis argentino en los próximos años.",
          latestResults: mockResults,
          profileUrl:
            "https://www.itftennis.com/en/players/jose-gabriel-fernandez/800654739/arg/jt/s/overview/",
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Fabrizio Mazzocchetti",
        source: "slicetoken.io",
        sport: "tennis",
        image: "fabrizio_mazzocchetti.png",
        metadata: {
          age: 16,
          bio: "Fabrizio Mazzocchetti, nacido el 24 de agosto de 2008 en Ciudad Evita, Argentina, es un talentoso joven tenista argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los cinco años en el Oasis Tennis Club. En 2022, Fabrizio logró un importante hito en su carrera al ganar el torneo COSAT Internacional Copa El Ceibo en la categoría sub-14, tanto en singles como en dobles. Este triunfo resaltó su habilidad y potencial en el tenis juvenil. Fabrizio se distingue por su dedicación y enfoque en mejorar su juego. Continúa entrenando intensamente para seguir avanzando en su carrera y representar a Argentina en futuros torneos internacionales. Con un prometedor inicio en el tenis, Fabrizio es una joven promesa que apunta a dejar una marca significativa en el tenis argentino.",
          latestResults: mockResults,
          profileUrl: null,
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Jaime López Rivarola",
        source: "slicetoken.io",
        sport: "golf",
        image: "jaime_lopez_rivarola.png",
        metadata: {
          age: 29,
          bio: "Jaime López Rivarola, nacido el 7 de febrero de 1995 en Buenos Aires, Argentina, es un golfista argentino. Comenzó su carrera en el golf a los 12 años en el Club Universitario de Buenos Aires, donde desarrolló su pasión por el deporte. Representó a Argentina en numerosas competencias a nivel amateur, incluyendo sudamericanos y campeonatos mundiales. Su dedicación y habilidad en el golf le valieron para integrar el equipo de golf de la Universidad de Georgia, donde se graduó como Licenciado en Economía. Después de finalizar sus estudios universitarios, López Rivarola dio el salto al profesionalismo en 2018. En 2022, logró un importante hito al ganar el Abierto de Brasil, un torneo perteneciente al PGA Tour Latinoamérica. Con una combinación única de talento deportivo y logros académicos, Jaime López Rivarola continúa dejando su marca en el mundo del golf argentino y profesional.",
          latestResults: mockResults,
          profileUrl:
            "https://www.pgatour.com/es/latinoamerica/player/39000/jaime-lopez-rivarola",
        },
      },
      {
        type: "silver",
        country: "peru",
        name: "Juan Pablo Varillas",
        source: "slicetoken.io",
        sport: "tennis",
        image: "juan_pablo_varillas.png",
        metadata: {
          age: 29,
          bio: "Juan Pablo Varillas nació el 6 de octubre de 1995 en Lima, Perú. Es un tenista profesional peruano conocido por su desempeño en canchas de arcilla. Comenzó a jugar tenis a los cinco años en el club donde sus padres eran socios. Durante su carrera, Varillas ha ganado varios títulos en el circuito ATP Challenger y ha alcanzado un ranking ATP en individuales de 60, el más alto de su carrera, en junio de 2023. Ese mismo año, hizo historia al llegar a la cuarta ronda de Roland Garros, siendo el primer peruano en alcanzar esta etapa en un Grand Slam en 29 años. En el mismo torneo, derrotó al 13º sembrado Hubert Hurkacz en un emocionante partido a cinco sets. En 2016, estuvo a punto de retirarse debido a una falta de resultados y confianza, pero el apoyo de su familia y entrenadores lo motivó a seguir adelante. Su ídolo es Rafael Nadal, quien lo inspiró a seguir esforzándose en el deporte. En su vida personal, Varillas disfruta del fútbol y es seguidor del Real Madrid. Le encanta la comida peruana, especialmente el ceviche.",
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/es/players/juan-pablo-varillas-/v836/overview",
        },
      },
      {
        type: "gold",
        country: "argentina",
        name: "Tomás Martín Etcheverry",
        source: "slicetoken.io",
        sport: "tennis",
        image: "tomas_martin_etcheverry.png",
        metadata: {
          age: 25,
          bio: 'Tomás Martín Etcheverry, nacido el 18 de julio de 1999 en La Plata, Argentina, es un destacado tenista argentino conocido por su potente saque y habilidades en canchas de arcilla. Con una altura de 1.96 metros, comenzó a jugar tenis a los cinco años gracias a sus padres, quienes le regalaron un "palo con pelota" durante unas vacaciones familiares. Desde entonces, su dedicación y ética de trabajo lo han impulsado a destacar en el deporte, inspirándose en jugadores como Novak Djokovic y Juan Martín del Potro. En su carrera junior, llegó a ser el número 12 del mundo, y como profesional, alcanzó el top 200 en junio de 2021 y el top 100 en abril de 2022. Su mejor ranking hasta la fecha es el número 27, logrado en febrero de 2024. El año 2023 fue especialmente destacado, llegando a los cuartos de final de Roland Garros y alcanzando las finales del ATP en Santiago y Houston. Este joven tenista continúa siendo una figura prominente en el tenis argentino y mundial, con grandes expectativas para futuros torneos y una prometedora carrera por delante.',
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/en/players/tomas-martin-etcheverry/ea24/overview",
        },
      },
    ],
    profit: 0.0,
    status: TeamStatus.WARMING_UP,
  },
  {
    id: "3",
    cards: [
      {
        type: "bronze",
        country: "argentina",
        name: "José Fernández",
        image: "jose_fernandez.png",
        source: "slicetoken.io",
        sport: "tennis",
        metadata: {
          age: 16,
          bio: "José Fernández, nacido el 6 de mayo de 2008 en La Banda, Santiago del Estero, Argentina, es un joven talento en ascenso en el tenis argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los siete años en el Santiago Lawn Tenis Club, donde rápidamente demostró un notable talento para el deporte. Desde sus primeros días en el club, José mostró una gran pasión y habilidad para el tenis. Gracias a su dedicación y a la guía de sus entrenadores, desarrolló una técnica sólida y un estilo de juego agresivo que lo destacaron entre sus compañeros. A los 14 años, alcanzó el puesto número 2 del ranking nacional argentino sub-14, un logro significativo que evidenció su potencial. En 2022, José representó a Argentina en el Mundial Sub-14 en la República Checa, compitiendo contra algunos de los mejores jóvenes tenistas del mundo. Su participación en este evento internacional no sólo elevó su perfil, sino que también le brindó una valiosa experiencia competitiva. Además, ha representado a su país en diversos torneos sudamericanos, demostrando orgullo y compromiso en cada encuentro. Fuera de las competencias, José se dedica intensamente a su entrenamiento, trabajando para mejorar continuamente su juego. Mantiene un equilibrio saludable entre su carrera deportiva y su vida personal, disfrutando de tiempo con su familia y amigos, así como de otras actividades deportivas y recreativas. Con una carrera en pleno desarrollo y una notable trayectoria en el ámbito juvenil, José Fernández promete ser una figura importante en el tenis argentino en los próximos años.",
          latestResults: mockResults,
          profileUrl:
            "https://www.itftennis.com/en/players/jose-gabriel-fernandez/800654739/arg/jt/s/overview/",
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Fabrizio Mazzocchetti",
        source: "slicetoken.io",
        sport: "tennis",
        image: "fabrizio_mazzocchetti.png",
        metadata: {
          age: 16,
          bio: "Fabrizio Mazzocchetti, nacido el 24 de agosto de 2008 en Ciudad Evita, Argentina, es un talentoso joven tenista argentino. Diestro y con un revés a dos manos, comenzó a jugar al tenis a los cinco años en el Oasis Tennis Club. En 2022, Fabrizio logró un importante hito en su carrera al ganar el torneo COSAT Internacional Copa El Ceibo en la categoría sub-14, tanto en singles como en dobles. Este triunfo resaltó su habilidad y potencial en el tenis juvenil. Fabrizio se distingue por su dedicación y enfoque en mejorar su juego. Continúa entrenando intensamente para seguir avanzando en su carrera y representar a Argentina en futuros torneos internacionales. Con un prometedor inicio en el tenis, Fabrizio es una joven promesa que apunta a dejar una marca significativa en el tenis argentino.",
          latestResults: mockResults,
          profileUrl: null,
        },
      },
      {
        type: "bronze",
        country: "argentina",
        name: "Jaime López Rivarola",
        source: "slicetoken.io",
        sport: "golf",
        image: "jaime_lopez_rivarola.png",
        metadata: {
          age: 29,
          bio: "Jaime López Rivarola, nacido el 7 de febrero de 1995 en Buenos Aires, Argentina, es un golfista argentino. Comenzó su carrera en el golf a los 12 años en el Club Universitario de Buenos Aires, donde desarrolló su pasión por el deporte. Representó a Argentina en numerosas competencias a nivel amateur, incluyendo sudamericanos y campeonatos mundiales. Su dedicación y habilidad en el golf le valieron para integrar el equipo de golf de la Universidad de Georgia, donde se graduó como Licenciado en Economía. Después de finalizar sus estudios universitarios, López Rivarola dio el salto al profesionalismo en 2018. En 2022, logró un importante hito al ganar el Abierto de Brasil, un torneo perteneciente al PGA Tour Latinoamérica. Con una combinación única de talento deportivo y logros académicos, Jaime López Rivarola continúa dejando su marca en el mundo del golf argentino y profesional.",
          latestResults: mockResults,
          profileUrl:
            "https://www.pgatour.com/es/latinoamerica/player/39000/jaime-lopez-rivarola",
        },
      },
      {
        type: "silver",
        country: "peru",
        name: "Juan Pablo Varillas",
        source: "slicetoken.io",
        sport: "tennis",
        image: "juan_pablo_varillas.png",
        metadata: {
          age: 29,
          bio: "Juan Pablo Varillas nació el 6 de octubre de 1995 en Lima, Perú. Es un tenista profesional peruano conocido por su desempeño en canchas de arcilla. Comenzó a jugar tenis a los cinco años en el club donde sus padres eran socios. Durante su carrera, Varillas ha ganado varios títulos en el circuito ATP Challenger y ha alcanzado un ranking ATP en individuales de 60, el más alto de su carrera, en junio de 2023. Ese mismo año, hizo historia al llegar a la cuarta ronda de Roland Garros, siendo el primer peruano en alcanzar esta etapa en un Grand Slam en 29 años. En el mismo torneo, derrotó al 13º sembrado Hubert Hurkacz en un emocionante partido a cinco sets. En 2016, estuvo a punto de retirarse debido a una falta de resultados y confianza, pero el apoyo de su familia y entrenadores lo motivó a seguir adelante. Su ídolo es Rafael Nadal, quien lo inspiró a seguir esforzándose en el deporte. En su vida personal, Varillas disfruta del fútbol y es seguidor del Real Madrid. Le encanta la comida peruana, especialmente el ceviche.",
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/es/players/juan-pablo-varillas-/v836/overview",
        },
      },
      {
        type: "gold",
        country: "argentina",
        name: "Tomás Martín Etcheverry",
        source: "slicetoken.io",
        sport: "tennis",
        image: "tomas_martin_etcheverry.png",
        metadata: {
          age: 25,
          bio: 'Tomás Martín Etcheverry, nacido el 18 de julio de 1999 en La Plata, Argentina, es un destacado tenista argentino conocido por su potente saque y habilidades en canchas de arcilla. Con una altura de 1.96 metros, comenzó a jugar tenis a los cinco años gracias a sus padres, quienes le regalaron un "palo con pelota" durante unas vacaciones familiares. Desde entonces, su dedicación y ética de trabajo lo han impulsado a destacar en el deporte, inspirándose en jugadores como Novak Djokovic y Juan Martín del Potro. En su carrera junior, llegó a ser el número 12 del mundo, y como profesional, alcanzó el top 200 en junio de 2021 y el top 100 en abril de 2022. Su mejor ranking hasta la fecha es el número 27, logrado en febrero de 2024. El año 2023 fue especialmente destacado, llegando a los cuartos de final de Roland Garros y alcanzando las finales del ATP en Santiago y Houston. Este joven tenista continúa siendo una figura prominente en el tenis argentino y mundial, con grandes expectativas para futuros torneos y una prometedora carrera por delante.',
          latestResults: mockResults,
          profileUrl:
            "https://www.atptour.com/en/players/tomas-martin-etcheverry/ea24/overview",
        },
      },
    ],
    profit: -5.0,
    status: TeamStatus.STRETCHING,
  },
];
