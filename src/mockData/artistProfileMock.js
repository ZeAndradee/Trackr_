export const mockArtistStats = {
  playCount: 1248,
  listeners: 89432,
  avgRating: 4.2,
  totalReviews: 3567,
  topMonth: "March 2026",
  topMonthPlays: 187,
  trendingCountry: "US",
  trendingCountryRank: 4,
  artistStart: "2014-06",
  monthlyData: (() => {
    const out = [];
    const start = new Date(2014, 5, 1);
    const end = new Date(2026, 3, 1);
    let s = 7;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const cur = new Date(start);
    while (cur <= end) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      const ramp = Math.min(1, (year - 2014) / 6);
      const base = 20 + 180 * ramp;
      const plays = Math.round(base * (0.4 + rand() * 1.2));
      out.push({
        year,
        month,
        label: cur.toLocaleDateString(undefined, {
          month: "short",
          year: "2-digit",
        }),
        plays,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
  })(),
};

export const mockArtistAbout = {
  bio: {
    extract:
      "An influential figure in contemporary music, known for blending genres and pushing creative boundaries. Beginning their career in the early 2010s, they quickly rose to prominence with a series of critically acclaimed releases that redefined modern pop and alternative music.\n\nTheir discography spans multiple studio albums, each exploring different sonic landscapes while maintaining a distinctive artistic identity. Collaborations with producers and artists across genres have further solidified their reputation as a versatile and innovative musician.\n\nBeyond music, they have been recognized for their contributions to visual arts and fashion, often incorporating multimedia elements into live performances and music videos. Their work has earned numerous awards and nominations, including multiple Grammy considerations.",
    source: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Artist",
    license: {
      name: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  },
  facts: {
    bornName: "Alex Morgan Reyes",
    bornDate: "1989-08-14",
    bornPlace: "Brooklyn, New York, USA",
    origin: "Los Angeles, California",
    activeSince: "2011",
    debutRelease: { name: "Paper Lanterns", year: 2012, type: "EP" },
    labels: ["Columbia Records", "Aurora Sound"],
    occupations: ["Singer", "Songwriter", "Producer"],
    instruments: ["Vocals", "Piano", "Synthesizer", "Guitar"],
    website: "https://example.com",
  },
  collaborators: [
    {
      name: "Jack Antonoff",
      role: "Producer",
      count: 14,
      image: "https://i.pravatar.cc/200?img=12",
    },
    {
      name: "Aaron Dessner",
      role: "Producer",
      count: 9,
      image: "https://i.pravatar.cc/200?img=33",
    },
    {
      name: "Phoebe Bridgers",
      role: "Vocals",
      count: 5,
      image: "https://i.pravatar.cc/200?img=47",
    },
    {
      name: "Mike Dean",
      role: "Mixing",
      count: 7,
      image: "https://i.pravatar.cc/200?img=15",
    },
    {
      name: "Sounwave",
      role: "Producer",
      count: 6,
      image: "https://i.pravatar.cc/200?img=22",
    },
  ],
  influences: [
    "Kate Bush",
    "Prince",
    "Joni Mitchell",
    "Radiohead",
    "Björk",
    "Stevie Wonder",
  ],
  influenced: ["Mitski", "Lorde", "Clairo", "Arlo Parks", "beabadoobee"],
  awards: [
    { year: 2023, title: "Grammy — Album of the Year", note: "Nominated" },
    { year: 2021, title: "Brit Award — International Artist", note: "Won" },
    { year: 2019, title: "Mercury Prize", note: "Nominated" },
    { year: 2017, title: "MTV VMA — Best Direction", note: "Won" },
  ],
  links: [
    { label: "Official", url: "https://example.com", host: "example.com" },
    {
      label: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Artist",
      host: "wikipedia.org",
    },
    {
      label: "Discogs",
      url: "https://www.discogs.com/artist/0",
      host: "discogs.com",
    },
    {
      label: "MusicBrainz",
      url: "https://musicbrainz.org/artist/0",
      host: "musicbrainz.org",
    },
    {
      label: "Last.fm",
      url: "https://www.last.fm/music/Artist",
      host: "last.fm",
    },
  ],
};

export const mockArtistBio = {
  extract:
    "An influential figure in contemporary music, known for blending genres and pushing creative boundaries. Beginning their career in the early 2010s, they quickly rose to prominence with a series of critically acclaimed releases that redefined modern pop and alternative music.\n\nTheir discography spans multiple studio albums, each exploring different sonic landscapes while maintaining a distinctive artistic identity. Collaborations with producers and artists across genres have further solidified their reputation as a versatile and innovative musician.\n\nBeyond music, they have been recognized for their contributions to visual arts and fashion, often incorporating multimedia elements into live performances and music videos. Their work has earned numerous awards and nominations, including multiple Grammy considerations.",
  source: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Artist",
  license: {
    name: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
