import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Cesta k music složce v public
    const musicDir = join(process.cwd(), 'public', 'music');
    
    // Načíst všechny soubory ze složky
    const files = await readdir(musicDir);
    
    // Filtrovat pouze MP3 soubory
    const mp3Files = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => ({
        name: file.replace('.mp3', ''),
        filename: file,
        url: `/music/${file}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({ tracks: mp3Files });
  } catch (error) {
    console.error('Error reading music directory:', error);
    // Fallback - vrátit prázdný seznam nebo default hudby
    return NextResponse.json({ 
      tracks: [
        { name: 'Ambient', filename: 'ambient.mp3', url: '/music/ambient.mp3' },
        { name: 'Strach', filename: 'strach.mp3', url: '/music/strach.mp3' },
      ] 
    });
  }
}
