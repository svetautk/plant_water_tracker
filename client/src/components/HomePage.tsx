// Главный экран со списком растений.
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import PlantList from './PlantList';
import PlantModal from './PlantModal';
import {
  useAddPlant,
  useDeletePlant,
  usePlants,
  useUpdatePlant,
  useWaterPlant,
} from '../hooks/usePlants';
import type { Plant, PlantInput } from '../types/plant';

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; plant: Plant };

export default function HomePage() {
  const { t } = useTranslation();
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });

  const plantsQuery = usePlants();
  const addMutation = useAddPlant();
  const updateMutation = useUpdatePlant();
  const waterMutation = useWaterPlant();
  const deleteMutation = useDeletePlant();

  // Мутация, которая относится к открытой форме: добавление или редактирование
  const saveMutation = modal.mode === 'edit' ? updateMutation : addMutation;

  // Достаём reset заранее: сам объект мутации новый на каждом рендере,
  // а функция reset стабильна. Если указать в зависимостях весь объект,
  // close пересоздавался бы постоянно, и useEffect в PlantModal перевешивал бы обработчик Escape.
  const resetAdd = addMutation.reset;
  const resetUpdate = updateMutation.reset;

  const close = useCallback(() => {
    setModal({ mode: 'closed' });
    // Сбрасываем ошибку, чтобы при следующем открытии формы она не висела
    resetAdd();
    resetUpdate();
  }, [resetAdd, resetUpdate]);

  const handleSave = (data: PlantInput) => {
    // У mutate есть второй аргумент: колбэки только для ЭТОГО вызова.
    // Закрываем окно лишь после ответа сервера. Если сервер вернёт ошибку,
    // окно останется открытым, и введённые данные не пропадут.
    const options = { onSuccess: close };
    if (modal.mode === 'edit') updateMutation.mutate({ id: modal.plant.id, data }, options);
    else addMutation.mutate(data, options);
  };

  // Ошибки действий прямо на карточке (полить, удалить) показываем общей плашкой
  const actionError = waterMutation.isError || deleteMutation.isError;

  const renderContent = () => {
    if (plantsQuery.isPending) {
      return <p className="status">{t('auth.loading')}</p>;
    }
    if (plantsQuery.isError) {
      return (
        <div className="status">
          <p>{t('plants.loadError')}</p>
          <button type="button" className="btn btn--ghost" onClick={() => plantsQuery.refetch()}>
            {t('auth.retry')}
          </button>
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
        <PlantModal
          plant={modal.mode === 'edit' ? modal.plant : undefined}
          onSave={handleSave}
          onClose={close}
          isSaving={saveMutation.isPending}
          errorText={saveMutation.isError ? t('plants.saveError') : undefined}
        />
      )}
    </>
  );
}
