"use client";

import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/language';

interface ShopItem {
    id: string;
    name: string;
    name_es: string;
    price: number;
    emoji: string;
    category: string;
}

const INITIAL_BUDGET = 100_000_000_000;

const shopItems: ShopItem[] = [
    // Food & Drinks ($1 - $50)
    { id: 'candy', name: 'Candy Bar', name_es: 'Barra de Chocolate', price: 2, emoji: '🍫', category: 'food' },
    { id: 'coffee', name: 'Coffee', name_es: 'Café', price: 4, emoji: '☕', category: 'food' },
    { id: 'bigmac', name: 'Big Mac', name_es: 'Big Mac', price: 5, emoji: '🍔', category: 'food' },
    { id: 'icecream', name: 'Ice Cream', name_es: 'Helado', price: 6, emoji: '🍦', category: 'food' },
    { id: 'burrito', name: 'Burrito', name_es: 'Burrito', price: 9, emoji: '🌯', category: 'food' },
    { id: 'pizza', name: 'Pizza', name_es: 'Pizza', price: 12, emoji: '🍕', category: 'food' },
    { id: 'sushi', name: 'Sushi Platter', name_es: 'Plato de Sushi', price: 30, emoji: '🍣', category: 'food' },
    { id: 'steak', name: 'Steak Dinner', name_es: 'Cena de Bistec', price: 50, emoji: '🥩', category: 'food' },
    { id: 'champagne', name: 'Champagne', name_es: 'Champán', price: 200, emoji: '🍾', category: 'food' },

    // Everyday Stuff ($10 - $500)
    { id: 'book', name: 'Book', name_es: 'Libro', price: 15, emoji: '📚', category: 'stuff' },
    { id: 'tshirt', name: 'T-Shirt', name_es: 'Camiseta', price: 25, emoji: '👕', category: 'stuff' },
    { id: 'sunglasses', name: 'Sunglasses', name_es: 'Gafas de Sol', price: 35, emoji: '🕶️', category: 'stuff' },
    { id: 'videogame', name: 'Video Game', name_es: 'Videojuego', price: 60, emoji: '🎮', category: 'stuff' },
    { id: 'perfume', name: 'Perfume', name_es: 'Perfume', price: 80, emoji: '🧴', category: 'stuff' },
    { id: 'sneakers', name: 'Sneakers', name_es: 'Zapatillas', price: 150, emoji: '👟', category: 'stuff' },
    { id: 'guitar', name: 'Guitar', name_es: 'Guitarra', price: 300, emoji: '🎸', category: 'stuff' },
    { id: 'bicycle', name: 'Bicycle', name_es: 'Bicicleta', price: 500, emoji: '🚲', category: 'stuff' },
    { id: 'suit', name: 'Designer Suit', name_es: 'Traje de Diseñador', price: 800, emoji: '🤵', category: 'stuff' },

    // Tech ($500 - $10,000)
    { id: 'headphones', name: 'AirPods Max', name_es: 'AirPods Max', price: 550, emoji: '🎧', category: 'tech' },
    { id: 'console', name: 'Gaming Console', name_es: 'Consola de Juegos', price: 500, emoji: '🕹️', category: 'tech' },
    { id: 'smartphone', name: 'Smartphone', name_es: 'Smartphone', price: 1200, emoji: '📱', category: 'tech' },
    { id: 'drone', name: 'Drone', name_es: 'Dron', price: 1500, emoji: '🤖', category: 'tech' },
    { id: 'laptop', name: 'Laptop', name_es: 'Laptop', price: 2500, emoji: '💻', category: 'tech' },
    { id: 'tv', name: '85" TV', name_es: 'TV 85"', price: 3000, emoji: '📺', category: 'tech' },
    { id: 'gamingpc', name: 'Gaming PC', name_es: 'PC Gamer', price: 5000, emoji: '🖥️', category: 'tech' },
    { id: 'hometheater', name: 'Home Theater', name_es: 'Cine en Casa', price: 8000, emoji: '🎬', category: 'tech' },

    // Luxury ($5,000 - $100,000)
    { id: 'designerbag', name: 'Designer Bag', name_es: 'Bolso de Diseñador', price: 5000, emoji: '👜', category: 'luxury' },
    { id: 'hottub', name: 'Hot Tub', name_es: 'Jacuzzi', price: 8000, emoji: '🛁', category: 'luxury' },
    { id: 'rolex', name: 'Rolex Watch', name_es: 'Reloj Rolex', price: 15000, emoji: '⌚', category: 'luxury' },
    { id: 'horse', name: 'Horse', name_es: 'Caballo', price: 25000, emoji: '🐴', category: 'luxury' },
    { id: 'wedding', name: 'Dream Wedding', name_es: 'Boda Soñada', price: 50000, emoji: '💒', category: 'luxury' },
    { id: 'goldbar', name: 'Gold Bar', name_es: 'Lingote de Oro', price: 75000, emoji: '🥇', category: 'luxury' },

    // Vehicles ($30,000 - $10,000,000)
    { id: 'motorcycle', name: 'Motorcycle', name_es: 'Motocicleta', price: 30000, emoji: '🏍️', category: 'vehicles' },
    { id: 'boat', name: 'Speedboat', name_es: 'Lancha Rápida', price: 60000, emoji: '🚤', category: 'vehicles' },
    { id: 'car', name: 'Sports Car', name_es: 'Auto Deportivo', price: 85000, emoji: '🏎️', category: 'vehicles' },
    { id: 'tesla', name: 'Tesla Model S', name_es: 'Tesla Model S', price: 95000, emoji: '🚗', category: 'vehicles' },
    { id: 'lamborghini', name: 'Lamborghini', name_es: 'Lamborghini', price: 300000, emoji: '�️', category: 'vehicles' },
    { id: 'helicopter', name: 'Helicopter', name_es: 'Helicóptero', price: 2000000, emoji: '🚁', category: 'vehicles' },
    { id: 'yacht', name: 'Yacht', name_es: 'Yate', price: 7500000, emoji: '🛥️', category: 'vehicles' },
    { id: 'privatejet', name: 'Private Jet', name_es: 'Jet Privado', price: 65000000, emoji: '✈️', category: 'vehicles' },

    // Property ($200,000 - $1,000,000,000)
    { id: 'apartment', name: 'Apartment', name_es: 'Apartamento', price: 250000, emoji: '🏢', category: 'property' },
    { id: 'house', name: 'House', name_es: 'Casa', price: 500000, emoji: '🏠', category: 'property' },
    { id: 'penthouse', name: 'Penthouse', name_es: 'Penthouse', price: 5000000, emoji: '🌆', category: 'property' },
    { id: 'mansion', name: 'Mansion', name_es: 'Mansión', price: 25000000, emoji: '🏰', category: 'property' },
    { id: 'island', name: 'Private Island', name_es: 'Isla Privada', price: 50000000, emoji: '🏝️', category: 'property' },
    { id: 'diamond', name: 'Giant Diamond', name_es: 'Diamante Gigante', price: 50000000, emoji: '💎', category: 'luxury' },
    { id: 'painting', name: 'Famous Painting', name_es: 'Pintura Famosa', price: 100000000, emoji: '🖼️', category: 'luxury' },
    { id: 'resort', name: 'Luxury Resort', name_es: 'Resort de Lujo', price: 150000000, emoji: '🏖️', category: 'property' },
    { id: 'hospital', name: 'Hospital', name_es: 'Hospital', price: 500000000, emoji: '🏥', category: 'property' },
    { id: 'skyscraper', name: 'Skyscraper', name_es: 'Rascacielos', price: 850000000, emoji: '🏙️', category: 'property' },

    // Mega ($100,000,000+)
    { id: 'movie', name: 'Hollywood Movie', name_es: 'Película de Hollywood', price: 200000000, emoji: '�', category: 'mega' },
    { id: 'stadium', name: 'Stadium', name_es: 'Estadio', price: 1500000000, emoji: '🏟️', category: 'mega' },
    { id: 'spacecraft', name: 'Space Mission', name_es: 'Misión Espacial', price: 2000000000, emoji: '🚀', category: 'mega' },
    { id: 'cruise', name: 'Cruise Ship', name_es: 'Crucero', price: 1000000000, emoji: '🚢', category: 'mega' },
    { id: 'nflteam', name: 'NFL Team', name_es: 'Equipo NFL', price: 4000000000, emoji: '�', category: 'mega' },
    { id: 'soccerclub', name: 'Soccer Club', name_es: 'Club de Fútbol', price: 5000000000, emoji: '⚽', category: 'mega' },
    { id: 'airline', name: 'Airline', name_es: 'Aerolínea', price: 10000000000, emoji: '�', category: 'mega' },
    { id: 'marscolony', name: 'Mars Colony', name_es: 'Colonia en Marte', price: 50000000000, emoji: '�', category: 'mega' },
];

function formatMoney(amount: number): string {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
}

function formatFullMoney(amount: number): string {
    return `$${amount.toLocaleString()}`;
}

export default function SpendMoneyGame() {
    const { t, language } = useLanguage();
    const [cart, setCart] = useState<Record<string, number>>({});

    const totalSpent = useMemo(() => {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const item = shopItems.find(i => i.id === id);
            return sum + (item ? item.price * qty : 0);
        }, 0);
    }, [cart]);

    const remaining = INITIAL_BUDGET - totalSpent;

    const buy = (id: string) => {
        const item = shopItems.find(i => i.id === id);
        if (!item || remaining < item.price) return;
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const sell = (id: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[id] > 1) {
                newCart[id]--;
            } else {
                delete newCart[id];
            }
            return newCart;
        });
    };

    const reset = () => setCart({});

    const spentPercent = (totalSpent / INITIAL_BUDGET) * 100;

    const purchasedItems = Object.entries(cart).filter(([, qty]) => qty > 0);

    return (
        <div className="h-full bg-gradient-to-b from-emerald-950 via-gray-950 to-gray-950 text-white p-2 sm:p-4 md:p-8 overflow-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black mb-2">{t('spend_title')}</h1>
                <div className="text-5xl md:text-6xl font-black text-emerald-400 font-mono tabular-nums">
                    {formatFullMoney(remaining)}
                </div>
                <p className="text-emerald-400/60 text-sm mt-1">{t('spend_remaining')}</p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{t('spend_total_spent')}: {formatMoney(totalSpent)}</span>
                    <span>{spentPercent.toFixed(2)}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Shop Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {shopItems.map(item => {
                    const qty = cart[item.id] || 0;
                    const canBuy = remaining >= item.price;
                    const itemName = language === 'es' ? item.name_es : item.name;

                    return (
                        <div
                            key={item.id}
                            className={`relative bg-gray-900/80 border rounded-xl p-3 flex flex-col items-center gap-1 transition-all ${
                                canBuy ? 'border-gray-700 hover:border-emerald-500/50' : 'border-gray-800 opacity-50'
                            }`}
                        >
                            <span className="text-3xl">{item.emoji}</span>
                            <span className="text-xs font-semibold text-center leading-tight">{itemName}</span>
                            <span className="text-xs text-emerald-400 font-mono">{formatMoney(item.price)}</span>

                            <div className="flex items-center gap-2 mt-1">
                                {qty > 0 && (
                                    <button
                                        onClick={() => sell(item.id)}
                                        className="w-7 h-7 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-800/50 text-sm font-bold flex items-center justify-center transition-colors"
                                    >
                                        −
                                    </button>
                                )}
                                {qty > 0 && (
                                    <span className="text-sm font-bold text-white min-w-[20px] text-center">{qty}</span>
                                )}
                                <button
                                    onClick={() => buy(item.id)}
                                    disabled={!canBuy}
                                    className="w-7 h-7 rounded-lg bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800/50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            {qty > 0 && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {qty}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Receipt */}
            {purchasedItems.length > 0 && (
                <div className="max-w-md mx-auto bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-300">{t('spend_receipt')}</h3>
                        <button
                            onClick={reset}
                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                            {t('spend_reset')}
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {purchasedItems.map(([id, qty]) => {
                            const item = shopItems.find(i => i.id === id)!;
                            const itemName = language === 'es' ? item.name_es : item.name;
                            return (
                                <div key={id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">
                                        {item.emoji} {itemName} x{qty}
                                    </span>
                                    <span className="font-mono text-emerald-400">
                                        {formatMoney(item.price * qty)}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold">
                            <span>{t('spend_total_spent')}</span>
                            <span className="text-emerald-400 font-mono">{formatMoney(totalSpent)}</span>
                        </div>
                    </div>
                </div>
            )}

            {purchasedItems.length === 0 && (
                <p className="text-center text-gray-500 text-sm">{t('spend_empty_cart')}</p>
            )}
        </div>
    );
}
