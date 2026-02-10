export interface Event {
  id: number;
  title: string;
  desc: string;
  img: string;
  date: string;
  location: string;
  time: string;
}

export const eventsData: Event[] = [
  {
    id: 1,
    title: 'MoU signed',
    desc: 'MoU signed with Porur Branch partner. Tentative date has been fixed for 1st July 2025. This strategic partnership marks a significant milestone in our expansion plans.',
    img: 'https://picsum.photos/seed/mou-signing/500/300',
    date: 'July 1, 2025',
    location: 'Porur Branch',
    time: '10:00 AM'
  },
  {
    id: 2,
    title: 'St. Joseph Arts and Science College',
    desc: 'Orientation program conducted at St. Joseph Arts and Science College, Kovur on 20th June 2025. Over 200 students participated in this interactive session.',
    img: 'https://picsum.photos/seed/college-orientation/500/300',
    date: 'June 20, 2025',
    location: 'St. Joseph College, Kovur',
    time: '09:30 AM'
  },
  {
    id: 3,
    title: "Birthday Celebration at IATT",
    desc: "birthday was joyfully celebrated at IATT on the evening of 10th July 2025. The team gathered for cake cutting and fun activities.",
    img: 'https://picsum.photos/seed/college-orientation/500/300',
    date: 'July 10, 2025',
    location: 'IATT Main Hall',
    time: '04:30 PM'
  },
  {
    id: 4,
    title: 'Team Building Workshop',
    desc: 'A productive day of team building activities and workshops held at the main campus. The focus was on collaboration and communication skills.',
    img: 'https://picsum.photos/seed/team-building/500/300',
    date: 'August 15, 2025',
    location: 'Main Campus',
    time: '09:00 AM'
  },
  {
    id: 5,
    title: 'Annual Tech Conference',
    desc: 'Insights from the latest tech conference attended by our development team. Key topics included AI, Cloud Computing, and Future Tech.',
    img: 'https://picsum.photos/seed/tech-conference/500/300',
    date: 'September 05, 2025',
    location: 'Convention Center',
    time: '10:00 AM'
  }
];
