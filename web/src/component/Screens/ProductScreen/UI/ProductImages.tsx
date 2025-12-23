// ProductImages.tsx
import { useState, useRef, useEffect } from 'react';
import { fetchApi } from '../../../../api/fetchApi'; // предполагаем, что fetchApi умеет делать multipart/form-data
import style from './ProductImages.module.css';

interface ProductImagesProps {
  images?: string[]; // текущие ссылки на изображения
  onImagesUpdate: (urls: string[]) => void; // колбэк для обновления product.image
}

export const ProductImages = ({ images = [], onImagesUpdate }: ProductImagesProps) => {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFullScreen = (url: string, index: number) => {
    setFullScreenImage(url);
    setCurrentIndex(index);
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Предполагаем, что сервер возвращает { url: string }
      const response = await fetchApi<{ url: string }>('upload', 'POST', formData, {});  // fetchApi должен корректно обработать FormData (без Content-Type)

      if (response?.url) {
        const newImages = [...images, response.url];
        onImagesUpdate(newImages);
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Не удалось загрузить изображение');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Обновляем URL в полноэкранном режиме при изменении images
  useEffect(() => {
    if (fullScreenImage && images.length > 0) {
      const idx = images.indexOf(fullScreenImage);
      if (idx === -1 && images.length > 0) {
        // Если текущее изображение исчезло — покажем первое
        setFullScreenImage(images[0]);
        setCurrentIndex(0);
      }
    }
  }, [images, fullScreenImage]);

  return (
    <>
      <div className={style.imageContainer}>
        {images.map((url, index) => (
          <div
            key={url}
            className={style.imageWrapper}
            onClick={() => openFullScreen(url, index)}
          >
            <img src={url} alt={`product-${currentIndex}`} className={style.thumbnail} />
          </div>
        ))}
        <div className={style.addImageButton} onClick={triggerFileInput}>
          +
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Fullscreen modal */}
      {fullScreenImage && (
        <div className={style.fullScreenOverlay} onClick={closeFullScreen}>
          <button className={`${style.navButton} ${style.prev}`} onClick={(e) => { e.stopPropagation(); goToPrev(); }}>
            ‹
          </button>
          <img src={fullScreenImage} alt="fullscreen" className={style.fullScreenImage} />
          <button className={`${style.navButton} ${style.next}`} onClick={(e) => { e.stopPropagation(); goToNext(); }}>
            ›
          </button>
        </div>
      )}
    </>
  );
};