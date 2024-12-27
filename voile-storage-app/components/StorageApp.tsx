import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  UniqueIdentifier,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Save, Upload, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SailItem: React.FC<{ sail: Sail }> = ({ sail }) => {
  return (
    <div className="bg-blue-100 p-2 h-16 w-full flex flex-col justify-center text-sm rounded hover:bg-blue-200 transition-colors">
      <div className="font-semibold truncate">{sail.name}</div>
      <div className="text-gray-600 truncate">{sail.type}</div>
    </div>
  );
};

const SortableItem: React.FC<SortableItemProps> = ({ sail, onDelete, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sail.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: '100%', // Assure que l'élément prend toute la largeur disponible
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="mb-2 cursor-move"
        onClick={(e) => {
          if (!isDragging) {
            setShowDetails(true);
          }
        }}
      >
        <SailItem sail={sail} />
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la voile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                'Nom': sail.name,
                'Type': sail.type,
                'Client': sail.clientName,
                'Bateau': sail.boatName,
                "Date d'ajout": new Date(sail.dateAdded).toLocaleDateString(),
                'Dernière modification': new Date(sail.lastModified).toLocaleDateString()
              }).map(([label, value]) => (
                <div key={label}>
                  <Label>{label}</Label>
                  <div>{value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={() => onEdit(sail)} variant="outline">
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La voile {sail.name} sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                onDelete(sail.id);
                setShowDeleteDialog(false);
                setShowDetails(false);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AnimatedDropZone = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  return (
    <div className={`relative border rounded-lg ${isDragging ? 'border-blue-400 border-2' : 'border-gray-200 border'}`}>
      {/* Zone de drop animée - visible uniquement pendant le drag */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-1/2 h-20 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/50
            animate-[pulse_2s_ease-in-out_infinite] flex items-center justify-center"
          >
            <div className="text-blue-500 text-sm font-medium animate-[bounce_1s_ease-in-out_infinite]">
              Déposer ici
            </div>
          </div>
        </div>
      )}
      {/* Contenu normal */}
      <div className={`${isDragging ? 'opacity-50' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const StorageLocation: React.FC<StorageLocationProps> = ({ 
  id, 
  title, 
  items, 
  onDelete, 
  onEdit,
  activeSail  // Récupération de la prop
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isDragging = !!activeSail;
  const isLargeDropZone = id === 'entree' || id === 'plancher';

  return (
    <div ref={setNodeRef}>
      {isLargeDropZone ? (
        <AnimatedDropZone isDragging={isDragging}>
          <div className="p-4">
            {title && <div className="text-sm font-semibold mb-4">{title}</div>}
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {items.map((sail) => (
                  <SortableItem 
                    key={sail.id}
                    sail={sail}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </AnimatedDropZone>
      ) : (
        <div className="border p-2 min-h-24">
          {title && <div className="text-sm font-semibold mb-1">{title}</div>}
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((sail) => (
                <SortableItem 
                  key={sail.id}
                  sail={sail}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const EditSailForm: React.FC<EditSailFormProps> = ({ sail, onEdit }) => {
  const [formData, setFormData] = useState({
    name: sail.name,
    type: sail.type,
    clientName: sail.clientName,
    boatName: sail.boatName,
    location: sail.position || 'entree'
  });

  const sailTypes = [
    "Grand-voile", "Génois", "Foc", "Spinnaker", "Gennaker",
    "Code 0", "Trinquette", "Tourmentin", "Voile d'étai"
  ];

  const allLocations = [
    { id: 'entree', label: 'Entrée' },
    { id: 'plancher', label: 'Plancher' },
    ...['A', 'B', 'C', 'D', 'E', 'F', 'G'].flatMap(aisle => 
      ['Haut', 'Bas'].map(level => ({
        id: `${aisle}_${level}`,
        label: `Allée ${aisle} - ${level}`
      }))
    )
  ];

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onEdit({
        ...sail,
        ...formData,
        position: formData.location,
        lastModified: new Date().toISOString()
      });
    }} className="space-y-4">
      {[
        { id: 'name', label: 'Nom de la voile', type: 'input' },
        { id: 'type', label: 'Type de voile', type: 'select', options: sailTypes },
        { id: 'clientName', label: 'Nom du client', type: 'input' },
        { id: 'boatName', label: 'Nom du bateau', type: 'input' },
        { id: 'location', label: 'Emplacement', type: 'select', options: allLocations }
      ].map(({ id, label, type, options }) => (
        <div key={id}>
          <Label htmlFor={id}>{label}</Label>
          {type === 'input' ? (
            <Input
              id={id}
              value={formData[id as keyof typeof formData]}
              onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
              required
            />
          ) : (
            <Select
              value={formData[id as keyof typeof formData]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [id]: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Choisir ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
              {options?.map((option: string | { id: string; label: string }) => (
                <SelectItem 
                  key={typeof option === 'string' ? option : option.id} 
                  value={typeof option === 'string' ? option : option.id}
                >
                  {typeof option === 'string' ? option : option.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
      <Button type="submit" className="w-full">Enregistrer les modifications</Button>
    </form>
  );
};

const StorageApp: React.FC = () => {
  const [storage, setStorage] = useState<StorageState>({});
  const [plancher, setPlancher] = useState<Sail[]>([]);
  const [entree, setEntree] = useState<Sail[]>([]);
  const [editingSail, setEditingSail] = useState<Sail | null>(null);
  const [activeSail, setActiveSail] = useState<Sail | null>(null);
  
  const aisles = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const levels = ['Haut', 'Bas'];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const findSailAndLocation = (id: string): [Sail | undefined, string] => {
    // Chercher dans l'entrée
    const entrySail = entree.find(s => s.id === id);
    if (entrySail) return [entrySail, 'entree'];

    // Chercher dans le plancher
    const floorSail = plancher.find(s => s.id === id);
    if (floorSail) return [floorSail, 'plancher'];

    // Chercher dans le stockage
    for (const [aisle, levels] of Object.entries(storage)) {
      for (const [level, sails] of Object.entries(levels)) {
        const sail = sails.find(s => s.id === id);
        if (sail) return [sail, `${aisle}_${level}`];
      }
    }

    return [undefined, ''];
  };

  const handleDragStart = (event: DragStartEvent) => {
    const [sail] = findSailAndLocation(event.active.id.toString());
    if (sail) {
      setActiveSail(sail);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag End:', event);
    const { active, over } = event;
    
    if (!active || !over) {
      console.log('No valid drag destination');
      setActiveSail(null);
      return;
    }

    const [sail, sourceLocation] = findSailAndLocation(active.id.toString());
    const destinationLocation = over.id.toString();

    console.log('Drag details:', {
      sail: sail?.name,
      from: sourceLocation,
      to: destinationLocation
    });

    if (!sail || sourceLocation === destinationLocation) {
      console.log('Invalid drag operation');
      setActiveSail(null);
      return;
    }

    // Supprimer de la source
    if (sourceLocation === 'entree') {
      setEntree(prev => prev.filter(s => s.id !== sail.id));
    } else if (sourceLocation === 'plancher') {
      setPlancher(prev => prev.filter(s => s.id !== sail.id));
    } else {
      const [aisle, level] = sourceLocation.split('_');
      setStorage(prev => ({
        ...prev,
        [aisle]: {
          ...prev[aisle],
          [level]: prev[aisle][level].filter(s => s.id !== sail.id)
        }
      }));
    }

    // Ajouter à la destination
    const updatedSail = {
      ...sail,
      position: destinationLocation,
      lastModified: new Date().toISOString()
    };

    console.log('Moving sail to new location:', updatedSail);

    if (destinationLocation === 'entree') {
      setEntree(prev => [...prev, updatedSail]);
    } else if (destinationLocation === 'plancher') {
      setPlancher(prev => [...prev, updatedSail]);
    } else {
      const [aisle, level] = destinationLocation.split('_');
      setStorage(prev => ({
        ...prev,
        [aisle]: {
          ...prev[aisle] || {},
          [level]: [...(prev[aisle]?.[level] || []), updatedSail]
        }
      }));
    }

    setActiveSail(null);
    console.log('Drag operation completed');
  };

  const addSailToLocation = (sail: Sail, location: string) => {
    const updatedSail = {
      ...sail,
      position: location,
      lastModified: new Date().toISOString()
    };

    if (location === 'entree') {
      setEntree(prev => [...prev, updatedSail]);
    } else if (location === 'plancher') {
      setPlancher(prev => [...prev, updatedSail]);
    } else {
      const [aisle, level] = location.split('_');
      setStorage(prev => ({
        ...prev,
        [aisle]: {
          ...prev[aisle] || {},
          [level]: [...(prev[aisle]?.[level] || []), updatedSail]
        }
      }));
    }
  };

  const calculateStats = () => {
    const allSails = [
      ...plancher,
      ...entree,
      ...Object.values(storage).flatMap(aisle =>
        Object.values(aisle).flat()
      )
    ];

    const sailsByClient = allSails.reduce<{ [key: string]: number }>((acc, sail) => ({
      ...acc,
      [sail.clientName]: (acc[sail.clientName] || 0) + 1
    }), {});

    return {
      total: allSails.length,
      floor: plancher.length,
      stored: allSails.length - plancher.length,
      oldestSail: allSails.reduce((oldest, sail) =>
        !oldest || new Date(sail.dateAdded) < new Date(oldest.dateAdded) ? sail : oldest
      , null as Sail | null),
      sailsByClient
    };
  };

  const renderStorageGrid = () => (
    <div className="grid grid-cols-7 gap-2">
      {aisles.map(aisle => (
        <div key={aisle} className="border p-2">
          <div className="text-center font-bold mb-2">Allée {aisle}</div>
          {levels.map(level => {
            const locationId = `${aisle}_${level}`;
            return (
            <StorageLocation
              key={locationId}
              id={locationId}
              title={level}
              items={storage[aisle]?.[level] || []}
              onDelete={(id) => {
                setStorage(prev => ({
                  ...prev,
                  [aisle]: {
                    ...prev[aisle],
                    [level]: prev[aisle]?.[level]?.filter(s => s.id !== id) || []
                  }
                }));
              }}
              onEdit={setEditingSail}
              activeSail={activeSail}  // Ajout de la prop
            />
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderStats = () => {
    const stats = calculateStats();
    const statCards = [
      { title: 'Total des voiles', value: stats.total, color: 'blue' },
      { title: 'Voiles stockées', value: stats.stored, color: 'green' },
      { title: 'Voiles au plancher', value: stats.floor, color: 'yellow' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques de Stockage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {statCards.map(({ title, value, color }) => (
                <div key={title} className={`p-4 bg-${color}-50 rounded-lg`}>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-2xl">{value}</p>
                </div>
              ))}
            </div>
            
            {stats.oldestSail && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-bold">Plus ancienne voile</h3>
                <p>Client: {stats.oldestSail.clientName}</p>
                <p>Bateau: {stats.oldestSail.boatName}</p>
                <p>Date ajout: {new Date(stats.oldestSail.dateAdded).toLocaleDateString()}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">Voiles par client</h3>
              {Object.entries(stats.sailsByClient).map(([client, count]) => (
                <div key={client} className="flex justify-between">
                  <span>{client}</span>
                  <span>{count} voiles</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Tabs defaultValue="storage">
          <TabsList>
            <TabsTrigger value="storage">Stockage</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>
          <TabsContent value="storage">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestion du Stockage des Voiles</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une voile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle voile</DialogTitle>
                    </DialogHeader>
                    <EditSailForm 
                      sail={{
                        id: crypto.randomUUID(),
                        dateAdded: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        name: '',
                        type: '',
                        clientName: '',
                        boatName: '',
                        position: 'entree'
                      }}
                      onEdit={(sail) => {
                        addSailToLocation(sail, sail.position);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Button onClick={() => {
                    const data = {
                      storage,
                      plancher,
                      entree,
                      lastExport: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `stockage-voiles-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Save className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const data = JSON.parse(e.target?.result as string);
                            setStorage(data.storage || {});
                            setPlancher(data.plancher || []);
                            setEntree(data.entree || []);
                          } catch (error) {
                            console.error('Erreur lors de l\'import:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden"
                    id="import-file"
                  />
                  <Label htmlFor="import-file">
                    <Button asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Importer
                      </span>
                    </Button>
                  </Label>
                </div>

                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Entrée</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <StorageLocation
                    id="entree"
                    items={entree}
                    onDelete={(id) => setEntree(prev => prev.filter(s => s.id !== id))}
                    onEdit={setEditingSail}
                    activeSail={activeSail}  // Ajout de la prop
                  />
                  </CardContent>
                </Card>

                {renderStorageGrid()}

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Plancher</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <StorageLocation
                    id="plancher"
                    items={plancher}
                    onDelete={(id) => setPlancher(prev => prev.filter(s => s.id !== id))}
                    onEdit={setEditingSail}
                    activeSail={activeSail}  // Ajout de la prop
                  />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            {renderStats()}
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingSail} onOpenChange={(open) => !open && setEditingSail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la voile</DialogTitle>
            </DialogHeader>
            {editingSail && (
              <EditSailForm
                sail={editingSail}
                onEdit={(updatedSail) => {
                  // Supprimer de l'ancienne position
                  if (editingSail.position === 'entree') {
                    setEntree(prev => prev.filter(s => s.id !== updatedSail.id));
                  } else if (editingSail.position === 'plancher') {
                    setPlancher(prev => prev.filter(s => s.id !== updatedSail.id));
                  } else {
                    const [oldAisle, oldLevel] = editingSail.position.split('_');
                    setStorage(prev => ({
                      ...prev,
                      [oldAisle]: {
                        ...prev[oldAisle],
                        [oldLevel]: prev[oldAisle]?.[oldLevel]?.filter(s => s.id !== updatedSail.id) || []
                      }
                    }));
                  }

                  // Ajouter à la nouvelle position
                  addSailToLocation(updatedSail, updatedSail.position);
                  setEditingSail(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </DndContext>
    </div>
  );
};

export default StorageApp;