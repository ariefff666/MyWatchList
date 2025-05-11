import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'; // Bisa juga hanya menggunakan satu StarIcon dan memanipulasi fill
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

interface StarRatingInputProps {
    rating: number; // Rating saat ini (0-5 untuk 5 bintang, hasil konversi dari 1-10)
    maxStars?: number;
    onRatingChange?: (newStarRating: number) => void; // Callback saat rating diubah (mengembalikan nilai 0-5)
    readOnly?: boolean;
    starSize?: string; // Tailwind class untuk ukuran bintang, e.g., "w-6 h-6"
    interactiveTextColor?: string; // Warna teks bintang saat interaktif (hover/selected)
    readOnlyTextColor?: string; // Warna teks bintang saat read-only
    emptyStarColor?: string; // Warna bintang kosong
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
    rating,
    maxStars = 5,
    onRatingChange,
    readOnly = false,
    starSize = 'w-6 h-6', // Ukuran default
    interactiveTextColor = 'text-yellow-400',
    readOnlyTextColor = 'text-yellow-500',
    emptyStarColor = 'text-gray-500',
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseOver = (index: number) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index: number) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(index); // Mengirimkan nilai bintang yang diklik (1-5)
        }
    };

    const currentRatingToDisplay = hoverRating || rating;

    return (
        <div className={`flex items-center space-x-0.5 ${readOnly ? '' : 'cursor-pointer'}`}>
            {[...Array(maxStars)].map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= currentRatingToDisplay;
                // Untuk menangani setengah bintang jika rating adalah desimal (misal 3.5)
                const isHalfFilled = !isFilled && starValue - 0.5 === currentRatingToDisplay;

                if (isHalfFilled) {
                    // Render bintang setengah
                    return (
                        <div
                            key={starValue}
                            className={`${starSize} relative ${readOnly ? '' : 'group'}`}
                            onMouseOver={() => handleMouseOver(starValue - 0.5)} // Atau starValue, tergantung logika hover
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(starValue - 0.5)}
                        >
                            <StarOutlineIcon className={`${starSize} ${emptyStarColor} absolute`} />
                            <StarSolidIcon
                                className={`${starSize} ${readOnly ? readOnlyTextColor : interactiveTextColor} absolute`}
                                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' }}
                            />
                        </div>
                    );
                }

                return (
                    // Render bintang penuh atau kosong
                    <StarSolidIcon
                        key={starValue}
                        className={`${starSize} ${
                            isFilled ? (readOnly ? readOnlyTextColor : interactiveTextColor) : emptyStarColor
                        } ${readOnly ? '' : 'group-hover:text-yellow-300'}`} // Efek hover pada grup jika interaktif
                        onMouseOver={() => handleMouseOver(starValue)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(starValue)}
                    />
                );
            })}
        </div>
    );
};

export default StarRatingInput;
