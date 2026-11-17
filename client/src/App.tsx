import { useState, useCallback } from 'react';
import Header from './components/Header';
import PlantList from './components/PlantList';
import PlantModal from './components/PlantModal';
import { usePlants } from './hooks/usePlants';
import type { Plant, PlantInput } from './types/plant';

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; plant: Plant };

export default function App() {
  const { plants, addPlant, updatePlant, removePlant, waterNow } = usePlants();
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });

  const close = useCallback(() => setModal({ mode: 'closed' }), []);

  const handleSave = (data: PlantInput) => {
    if (modal.mode === 'edit') updatePlant(modal.plant.id, data);
    else addPlant(data);
    close();
  };

  return (
    <>
      <Header onAdd={() => setModal({ mode: 'add' })} />
      <main className="main">
        <PlantList
          plants={plants}
          onEdit={(plant: Plant) => setModal({ mode: 'edit', plant })}
          onDelete={removePlant}
          onWater={waterNow}
        />
      </main>

      {modal.mode !== 'closed' && (
        <PlantModal
          plant={modal.mode === 'edit' ? modal.plant : undefined}
          onSave={handleSave}
          onClose={close}
        />
      )}
    </>
  );
}