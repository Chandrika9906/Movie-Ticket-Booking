// src/data/moviesData.js
import FM1 from "../../assets/FM1.png"
import FM2 from "../../assets/FM2.png"
import FM3 from "../../assets/FM3.png"
import FM4 from "../../assets/FM4.png"
import FM5 from "../../assets/FM5.png"
import FM6 from "../../assets/FM6.png"

import FMD1 from "../../assets/FMD1.png"
import FMD2 from "../../assets/FMD2.png"
import FMP1 from "../../assets/FMP1.png"
import FMC1 from "../../assets/FMC1.png"
import FMC2 from "../../assets/FMC2.png"
import FMC3 from "../../assets/FMC3.png"



const movies = [
  {
    id: 1,
    title: "Fighter",
    img: FM1,
    duration: "2h 20m",
    category: "action",
    rating: "7.8",
    genre: "Action",
    price: 250,
    synopsis: "High-octane aerial action and a tale of duty and brotherhood set in the world of fighter pilots.",
    director: [
      { name: "Karan Verma", img: FMD1 },
      { name: "Rhea Kapoor", img: FMD2 }
    ],
    producer: { name: "Zoya Kapoor", img: FMP1 },
    cast: [
      { name: "Arjun Shetty", role: "Lead (Hero)", img: FMC1 },
      { name: "Nikita Rao", role: "Lead (Heroine)", img:  FMC2 },
      { name: "Ramesh Pillai", role: "Wing Commander", img:  FMC3 },
    ],
    slots: [
      { time: "2025-09-24T10:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T16:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-24T20:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T09:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T13:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-25T18:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T11:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-26T14:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-26T19:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T10:15:00+05:30", audi: "Audi 1" },
      { time: "2025-09-27T15:45:00+05:30", audi: "Audi 2" },
      { time: "2025-09-27T20:15:00+05:30", audi: "Audi 3" },
      { time: "2025-09-28T12:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-28T16:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T09:45:00+05:30", audi: "Audi 3" },
      { time: "2025-09-29T13:15:00+05:30", audi: "Audi 1" },
      { time: "2025-09-29T21:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-30T11:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-30T17:00:00+05:30", audi: "Audi 1" }
    ],
    trailer: "https://youtu.be/GJ-wYUcp8Dg?si=bRPDomchYp9awTlU"
  },

  {
    id: 2,
    title: "Peddi",
    img: FM2,
    duration: "2h 5m",
    category: "Comedy",
    rating: "6.9",
    genre: "Drama / Comedy",
    price: 180,
    synopsis: "A family drama with warm humor — traditions, rivalries and a big wedding plan that changes lives.",
    director: { name: "Meera Nair", img: FMD1 },
    producer: { name: "S unit Films", img: FMP1 },
    cast: [
      { name: "Vikram Rana", role: "Hero", img: FMC1 },
      { name: "Pooja Iyer", role: "Heroine", img: FMC2 },
      { name: "Gopal Das", role: "Comic Support", img: FMC3 },
    ],
    slots: [
      { time: "2025-09-24T11:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T14:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-25T10:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T13:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T19:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-26T15:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T20:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-27T09:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-27T12:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T18:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-28T13:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-28T16:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-29T10:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-29T14:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T19:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-30T12:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-30T18:15:00+05:30", audi: "Audi 2" }
    ],
    trailer: "https://youtu.be/77KAnoqpoFw?si=H7pXKwB2ctGlyt3f"
  },

  {
    id: 3,
    title: "Baaghi 4",
    img: FM3,
    duration: "2h 10m",
    category: "Action",
    rating: "7.2",
    genre: "Action / Thriller",
    price: 220,
    synopsis: "A relentless action-packed thriller where an ex-commando takes on powerful adversaries in a fight for justice.",
    director: { name: "Ravi K. Menon", img: FMD1 },
    producer: { name: "Blue Oak Productions", img:FMP1 },
    cast: [
      { name: "Karan Malhotra", role: "Lead", img: FMC1 },
      { name: "Sana Mirza", role: "Lead Female", img: FMC2 },
      { name: "Dilip Sen", role: "Villain", img: FMC3 },
    ],
    slots: [
      { time: "2025-09-24T08:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T12:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-24T21:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T11:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T17:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-26T10:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T13:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-26T20:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-27T14:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T19:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-28T09:15:00+05:30", audi: "Audi 2" },
      { time: "2025-09-28T15:45:00+05:30", audi: "Audi 3" },
      { time: "2025-09-28T22:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-29T13:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T18:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-30T10:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-30T16:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-30T20:30:00+05:30", audi: "Audi 3" }
    ],
    trailer: "https://youtu.be/58909OjAfeg?si=0eP30razSw0TMNmI"
  },

  {
    id: 4,
    title: "Kantara",
    img: FM4,
    duration: "2h 30m",
    rating: "8.5",
    genre: "Drama / Folk",
    category: "Action",
    price: 240,
    synopsis: "A visceral folk-driven tale of land, tradition and survival; raw performances and immersive visuals.",
    director: { name: "Nandu Prakash", img: FMD1 },
    producer: { name: "Riverbend Studios", img: FMP1 },
    cast: [
      { name: "Manoj Gowda", role: "Protagonist", img: FMC1 },
      { name: "Revathi Shenoy", role: "Lead Female", img: FMC2},
      { name: "Harish Rao", role: "Elder", img: FMC3},
    ],
    slots: [
      { time: "2025-09-24T10:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T13:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-24T19:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T12:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T15:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-25T17:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T16:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-26T19:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-27T11:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T14:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-27T20:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-28T09:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-28T13:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-29T15:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T18:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-30T17:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-30T21:00:00+05:30", audi: "Audi 2" }
    ],
    trailer: "https://youtu.be/M2OnifMgvps?si=H9rdjvoXrajqMLJl"
  },

  {
    id: 5,
    title: "Param Sundari",
    img: FM5,
    duration: "2h 0m",
    rating: "7.0",
    genre: "Romance / Drama",
    category: "Comedy",
    price: 200,
    synopsis: "A colorful romantic drama about self-discovery, modern love and cultural celebration.",
    director: { name: "Anjali Deshmukh", img: FMD1 },
    producer: { name: "Lotus Films", img: FMP1 },
    cast: [
      { name: "Rahul Bhatt", role: "Hero", img: FMC1 },
      { name: "Neha Batra", role: "Heroine", img: FMC2},
      { name: "Kishore Lal", role: "Friend", img: FMC3 },
    ],
    slots: [
      { time: "2025-09-24T10:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T14:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-24T19:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T09:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T13:15:00+05:30", audi: "Audi 2" },
      { time: "2025-09-26T11:15:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T16:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-26T20:15:00+05:30", audi: "Audi 2" },
      { time: "2025-09-27T12:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T15:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-28T10:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-28T14:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-28T19:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-29T11:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T17:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-30T13:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-30T18:00:00+05:30", audi: "Audi 2" }
    ],
    trailer: "https://youtu.be/fdWnfzsx-ks?si=uLy5KfypNUIiBz74"
  },

  {
    id: 6,
    title: "Maalik",
    img:FM6,
    duration: "2h 8m",
    rating: "7.4",
    category: "Action",
    genre: "Crime / Thriller",
    price: 210,
    synopsis: "A taut crime thriller that follows a small-town cop as he uncovers a deep-rooted conspiracy.",
    director: { name: "Vikram S.", img:FMD1 },
    producer: { name: "NorthStar Pictures", img: FMP1},
    cast: [
      { name: "Aditya Malhotra", role: "Officer", img: FMC1 },
      { name: "Ishita Kapoor", role: "Investigator", img: FMC2 },
      { name: "Suresh Nair", role: "Antagonist", img: FMC3},
    ],
    slots: [
      { time: "2025-09-24T09:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-24T12:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-24T20:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-25T10:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-25T14:00:00+05:30", audi: "Audi 2" },
      { time: "2025-09-25T19:00:00+05:30", audi: "Audi 3" },
      { time: "2025-09-26T08:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-26T13:15:00+05:30", audi: "Audi 2" },
      { time: "2025-09-26T18:45:00+05:30", audi: "Audi 3" },
      { time: "2025-09-27T11:30:00+05:30", audi: "Audi 1" },
      { time: "2025-09-27T16:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-28T12:15:00+05:30", audi: "Audi 3" },
      { time: "2025-09-28T17:45:00+05:30", audi: "Audi 1" },
      { time: "2025-09-28T21:30:00+05:30", audi: "Audi 2" },
      { time: "2025-09-29T09:30:00+05:30", audi: "Audi 3" },
      { time: "2025-09-29T15:00:00+05:30", audi: "Audi 1" },
      { time: "2025-09-30T10:45:00+05:30", audi: "Audi 2" },
      { time: "2025-09-30T19:15:00+05:30", audi: "Audi 3" }
    ],
    trailer: "https://youtu.be/0itY1Fhvnnk?si=kzRlptK14bBSdknj"
  },
];

export default movies;
