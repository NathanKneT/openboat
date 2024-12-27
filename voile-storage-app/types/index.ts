interface Sail {
  id: string;
  name: string;
  type: string;
  clientName: string;
  boatName: string;
  dateAdded: string;
  lastModified: string;
  position: string;
}

interface SortableItemProps {
  sail: Sail;
  onDelete: (id: string) => void;
  onEdit: (sail: Sail) => void;
}

interface StorageLocationProps {
  id: string;
  title?: string;
  items: Sail[];
  onDelete: (id: string) => void;
  onEdit: (sail: Sail) => void;
  activeSail: Sail | null;
}

interface EditSailFormProps {
  sail: Sail;
  onEdit: (sail: Sail) => void;
  onClose?: () => void;
}

interface StorageState {
  [aisle: string]: {
    [level: string]: Sail[];
  };
}