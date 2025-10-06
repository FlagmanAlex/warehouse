// src/components/EntitySelectModal.tsx

import { Button } from "../../shared/Button";
import { SelectModal } from "./UI/SelectModal";
import { useEntitySelectModal } from "./hooks/useEntitySelectModal";
import type { EntityConstraint } from "./types/EntityConstraint";
import styles from "./EntitySelectModal.module.css";

interface EntitySelectModalProps {
    endpoint: string; // ← например: 'category', 'brand'
    selectedItem: EntityConstraint | null;
    onSelect: (item: EntityConstraint) => void;
    buttonText?: string; // ← опциональный текст кнопки
    modalTitle?: string; // ← опциональный заголовок модалки
}



export function EntitySelectModal({
    endpoint,
    selectedItem,
    onSelect,
    buttonText = selectedItem?.name || 'Выберите...',
    modalTitle = 'Выберите элемент',
}: EntitySelectModalProps) {
    const {
        isOpen,
        openModal,
        closeModal,
        handleSelect: handleInternalSelect,
        items,
        isLoading,
        error,
    } = useEntitySelectModal({
        endpoint,
        initialSelectedItem: selectedItem,
    });


    // Прокидываем выбор в родительский компонент
    const handleEntitySelect = (item: EntityConstraint) => {
        handleInternalSelect(item);
        onSelect(item); // ← вызываем onSelect из пропсов
    };

    return (
        <>
            <Button
                className={styles.selectButton}
                onClick={openModal}
                text={buttonText}
                bgColor="#fff"
            />

            <SelectModal
                isOpen={isOpen}
                onClose={closeModal}
                onSelect={handleEntitySelect}
                items={items}
                title={modalTitle}
                loading={isLoading}
                error={error?.message}
                selectedItem={selectedItem}
            />
        </>
    );
}