export type Talent = {
  id: string;
  name: string;
  city: string;
  roles: string[];
  languages: string[];
  tagline: string;
  bio?: string;
  availability: "available" | "limited" | "booked";
  showreelUrl?: string;
  photos?: string[];
  email?: string;
  phone?: string;
};

export type Casting = {
  id: string;
  title: string;
  production: string;
  city: string;
  role: string;
  shootDates: string;
  paid: boolean;
  director: string;
  summary: string;
};
