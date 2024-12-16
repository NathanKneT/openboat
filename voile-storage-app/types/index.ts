export interface Sail {
    id: string;
    name: string;
    type: SailType;
    clientId: string;
    clientName: string;
    boatId: string;
    boatName: string;
    dateAdded: string;
    lastModified: string;
    position: string;
  }
  
  export interface Client {
    id: string;
    name: string;
    boats: Boat[];
  }
  
  export interface Boat {
    id: string;
    name: string;
    clientId: string;
  }

  export type SailType = 
  | "Grand-voile" 
  | "Génois" 
  | "Foc" 
  | "Spinnaker"
  | "Gennaker"
  | "Code 0"
  | "Trinquette"
  | "Tourmentin"
  | "Voile d'étai";

  export interface StorageLocationProps {
    id: string;
    title?: string;
    items: Sail[];
  }

  export interface SortableItemProps {
    id: string;
    sail: Sail;
  }
  
  export type StorageLocation = 'entree' | 'plancher' | `${string}_${string}`;
  
  export interface StorageData {
    [aisle: string]: {
      [level: string]: Sail[];
    };
  }