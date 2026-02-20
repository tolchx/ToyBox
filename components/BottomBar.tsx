'use client';

import GlobalMusicPlayer from './GlobalMusicPlayer';
import ChatWidget from './ChatWidget';

export default function BottomBar() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col justify-end pointer-events-none">
            {/* The Chat Widget floats above the bar on the right */}
            <div className="absolute bottom-20 right-4 pointer-events-auto z-50">
                <ChatWidget />
            </div>

            {/* The Music Player takes the full width at the bottom */}
            <div className="pointer-events-auto shadow-2xl w-full bg-transparent">
                <GlobalMusicPlayer />
            </div>
        </div>
    );
}
