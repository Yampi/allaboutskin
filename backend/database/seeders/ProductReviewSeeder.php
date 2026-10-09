<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'product_slug' => 'the-ordinary-niacinamide-10-zinc-1',
                'user_name' => 'Valentina Méndez',
                'user_skin_type' => 'Piel Grasa con tendencia a acné',
                'rating' => 5,
                'title' => 'Reducción notable de poros y control de brillo en 3 semanas',
                'comment' => 'Tenía la zona T con mucho brillo y poros dilatados. Lo incorporé en mis noches de recuperación y post-exfoliación. La textura se siente sedosa y el sebo se redujo notablemente sin resecar la piel.',
                'usage_duration' => '3 semanas',
                'helpful_count' => 38,
            ],
            [
                'product_slug' => 'the-ordinary-niacinamide-10-zinc-1',
                'user_name' => 'Dr. Carlos Pacheco (Farmacéutico)',
                'user_skin_type' => 'Piel Mixta',
                'rating' => 5,
                'title' => 'Excelente sinergia química y relación costo-beneficio',
                'comment' => 'El Zinc PCA complementa perfectamente a la vitamina B3 para calmar la micro-inflamación y estabilizar la síntesis de sebo. Recomiendo aplicarlo sobre piel ligeramente humectada para máxima absorción.',
                'usage_duration' => 'Más de 3 meses',
                'helpful_count' => 64,
            ],
            [
                'product_slug' => 'the-ordinary-niacinamide-10-zinc-1',
                'user_name' => 'Mariana Silveira',
                'user_skin_type' => 'Piel Sensible',
                'rating' => 4,
                'title' => 'Muy bueno, aunque requirió introducirlo poco a poco',
                'comment' => 'Al principio sentí un cosquilleo leve porque el 10% es concentrado. Lo alterné con mi hidratante de ceramidas y a los 10 días mi piel lo toleró perfecto. El tono se ve más parejo y luminoso.',
                'usage_duration' => '1 mes',
                'helpful_count' => 22,
            ],
            [
                'product_slug' => 'paulas-choice-skin-perfecting-2-bha-liquid-exfoliant',
                'user_name' => 'Lucía Albornoz',
                'user_skin_type' => 'Piel Grasa / Mixta',
                'rating' => 5,
                'title' => 'El mejor exfoliante de BHA que he probado para puntos negros',
                'comment' => 'Llevaba meses batallando con filamentos sebáceos en la nariz. En mi Noche 1 de Skin Cycling hace maravillas. No irrita gracias al extracto de té verde y a los 15 minutos deja la piel lisa como cristal.',
                'usage_duration' => '6 semanas',
                'helpful_count' => 51,
            ],
            [
                'product_slug' => 'paulas-choice-skin-perfecting-2-bha-liquid-exfoliant',
                'user_name' => 'Andrés Rivas',
                'user_skin_type' => 'Piel Mixta',
                'rating' => 5,
                'title' => 'Indispensable para el primer paso del ciclo nocturno',
                'comment' => 'Apenas 3 gotas en las palmas y palmaditas suaves. No uso algodón para no desperdiciar. Mis brotes desaparecieron por completo.',
                'usage_duration' => '2 meses',
                'helpful_count' => 29,
            ],
            [
                'product_slug' => 'cerave-foaming-facial-cleanser',
                'user_name' => 'Camila Delgado',
                'user_skin_type' => 'Piel Sensible y Reactiva',
                'rating' => 5,
                'title' => 'Limpia profundamente sin tirar ni quebrar la barrera',
                'comment' => 'Muchas limpiadoras te dejan la cara acartonada, pero esta respeta el manto lipídico gracias a las 3 ceramidas y el ácido hialurónico. Hace una espuma muy suave y rinde un montón.',
                'usage_duration' => 'Más de 3 meses',
                'helpful_count' => 43,
            ],
            [
                'product_slug' => 'la-roche-posay-cicaplast-baume-b5',
                'user_name' => 'Sofía Escalona',
                'user_skin_type' => 'Piel Seca con Rojez',
                'rating' => 5,
                'title' => 'Salvavidas absoluto para noches de recuperación',
                'comment' => 'Es el bálsamo definitivo tras usar retinoides. El pantenol al 5% y el madecassoside calman cualquier tirantez al instante. Se siente como una manta protectora para el rostro.',
                'usage_duration' => '2 meses',
                'helpful_count' => 87,
            ],
            [
                'product_slug' => 'skinceuticals-retinol-0-3',
                'user_name' => 'Elena Barrios',
                'user_skin_type' => 'Piel Madura / Normal',
                'rating' => 5,
                'title' => 'Microencapsulación de alta tolerancia y resultados visibles',
                'comment' => 'Llevo 4 semanas con la fase de retinización en mi noche 2. La textura de la piel se ha refinado increíblemente y las líneas de expresión en la frente se ven más atenuadas.',
                'usage_duration' => '1 mes',
                'helpful_count' => 34,
            ],
        ];

        foreach ($reviews as $rev) {
            ProductReview::firstOrCreate(
                [
                    'product_slug' => $rev['product_slug'],
                    'user_name' => $rev['user_name'],
                ],
                $rev
            );
        }
    }
}
