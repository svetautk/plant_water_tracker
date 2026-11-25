import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import PlantList from './PlantList';
import PlantModal from './PlantModal';
import { useDeletePlant, usePlants, useWaterPlant } from '../hooks/usePlants';
import type { Plant } from '../types/plant';

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; plant: Plant };

export default function HomePage() {
  const { t } = useTranslation();
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });

  const plantsQuery = usePlants();
  const waterMutation = useWaterPlant();
  const deleteMutation = useDeletePlant();

  const close = useCallback(() => setModal({ mode: 'closed' }), []);

  const actionError = waterMutation.isError || deleteMutation.isError;

  const renderContent = () => {
    if (plantsQuery.isPending) {
      return <p className="status">{t('auth.loading')}</p>;
    }
    if (plantsQuery.isError) {
      return (
        <div className="status">
          <p>{t('plants.loadError')}</p>
          <p>{t('auth.reloadHint')}</p>
        </div>
      );
    }
    return (
      <PlantList
        plants={plantsQuery.data}
        onEdit={(plant: Plant) => setModal({ mode: 'edit', plant })}
        onDelete={(id) => deleteMutation.mutate(id)}
        onWater={(id) => waterMutation.mutate(id)}
      />
    );
  };

  return (
    <>
      <Header onAdd={() => setModal({ mode: 'add' })} />
      <main className="main">
        {actionError && (
          <p className="banner-error" role="alert">
            {t('plants.actionError')}
          </p>
        )}
        {renderContent()}
      </main>

      {modal.mode !== 'closed' && (
        <PlantModal plant={modal.mode === 'edit' ? modal.plant : undefined} onClose={close} />
      )}
    </>
  );
}
