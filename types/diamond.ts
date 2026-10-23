export type DiamondShape =
  | "Round"
  | "Oval"
  | "Pear"
  | "Marquise"
  | "Emerald"
  | "Princess"
  | "Cushion"
  | "Radiant"
  | "Asscher"
  | "Heart";

export type DiamondOrigin = "Natural" | "Lab-Grown";

export type DiamondCut = "Excellent" | "Very Good" | "Good";

export type DiamondColor = "D" | "E" | "F" | "G" | "H" | "I" | "J";

export type DiamondClarity =
  | "FL"
  | "IF"
  | "VVS1"
  | "VVS2"
  | "VS1"
  | "VS2"
  | "SI1"
  | "SI2";

export interface DiamondDimensions {
  length: number;
  width: number;
  depth: number;
}

export interface DiamondCertification {
  laboratory: "GIA" | "IGI";
  certificateNumber: string;
  verificationUrl?: string;
  issueDate?: string;
  inscribed?: boolean;
}

export interface Diamond {
  id: string;
  shape: DiamondShape;
  origin: DiamondOrigin;
  carat: number;
  cut: DiamondCut;
  color: DiamondColor;
  clarity: DiamondClarity;
  dimensions: DiamondDimensions;
  certification: DiamondCertification;
  polish?: "Excellent" | "Very Good";
  symmetry?: "Excellent" | "Very Good";
  fluorescence?: "None" | "Faint" | "Medium";
  tablePercentage?: number;
  depthPercentage?: number;
  ratio?: number;
  images: string[];
  video360?: string;
  viewer3D?: string;
  description?: string;
  featured?: boolean;
  availability?: "Available" | "Reserved" | "Sold";
  createdAt: string;
}

export interface DiamondFiltersState {
  shape: DiamondShape[];
  origin: DiamondOrigin | "All";
  cut: DiamondCut[];
  color: DiamondColor[];
  clarity: DiamondClarity[];
  laboratory: ("GIA" | "IGI")[];
  caratMin: number;
  caratMax: number;
  sortBy: "carat-asc" | "carat-desc" | "newest";
}
