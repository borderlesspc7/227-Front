import React, { useState } from "react";
import "./ImageCarousel.css";

interface ImageCarouselProps {
    images: Array<{
        id: string;
        nome: string;
        url: string;
        tipo: string;
    }>;
    className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className={`image-carousel ${className}`}>
                <div className="image-carousel__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                    </svg>
                    <p>Nenhuma imagem disponível</p>
                </div>
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsFullscreen(false);
        } else if (e.key === "ArrowLeft") {
            goToPrevious();
        } else if (e.key === "ArrowRight") {
            goToNext();
        }
    };

    return (
        <div className={`image-carousel ${className}`}>
            <div className="image-carousel__header">
                <h4 className="image-carousel__title">
                    Imagens de Evidência ({images.length})
                </h4>
            </div>

            <div className="image-carousel__container">
                {/* Imagem principal */}
                <div className="image-carousel__main">
                    <div className="image-carousel__image-wrapper">
                        <img
                            src={images[currentIndex].url}
                            alt={images[currentIndex].nome}
                            className="image-carousel__image"
                            onClick={toggleFullscreen}
                        />

                        {/* Botões de navegação */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="image-carousel__nav-btn image-carousel__nav-btn--prev"
                                    onClick={goToPrevious}
                                    aria-label="Imagem anterior"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button
                                    className="image-carousel__nav-btn image-carousel__nav-btn--next"
                                    onClick={goToNext}
                                    aria-label="Próxima imagem"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Botão de fullscreen */}
                        <button
                            className="image-carousel__fullscreen-btn"
                            onClick={toggleFullscreen}
                            aria-label="Visualizar em tela cheia"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        </button>

                        {/* Contador de imagens */}
                        <div className="image-carousel__counter">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Informações da imagem */}
                    <div className="image-carousel__info">
                        <h5 className="image-carousel__image-name">
                            {images[currentIndex].nome}
                        </h5>
                        <p className="image-carousel__image-type">
                            {images[currentIndex].tipo}
                        </p>
                    </div>
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                    <div className="image-carousel__thumbnails">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                className={`image-carousel__thumbnail ${index === currentIndex ? "image-carousel__thumbnail--active" : ""
                                    }`}
                                onClick={() => goToSlide(index)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.nome}
                                    className="image-carousel__thumbnail-image"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de tela cheia */}
            {isFullscreen && (
                <div
                    className="image-carousel__fullscreen-modal"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <div className="image-carousel__fullscreen-content">
                        <button
                            className="image-carousel__close-btn"
                            onClick={() => setIsFullscreen(false)}
                            aria-label="Fechar tela cheia"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18" />
                                <path d="M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="image-carousel__fullscreen-image-wrapper">
                            <img
                                src={images[currentIndex].url}
                                alt={images[currentIndex].nome}
                                className="image-carousel__fullscreen-image"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    className="image-carousel__fullscreen-nav image-carousel__fullscreen-nav--prev"
                                    onClick={goToPrevious}
                                    aria-label="Imagem anterior"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button
                                    className="image-carousel__fullscreen-nav image-carousel__fullscreen-nav--next"
                                    onClick={goToNext}
                                    aria-label="Próxima imagem"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div className="image-carousel__fullscreen-info">
                            <h3 className="image-carousel__fullscreen-title">
                                {images[currentIndex].nome}
                            </h3>
                            <p className="image-carousel__fullscreen-counter">
                                {currentIndex + 1} de {images.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
