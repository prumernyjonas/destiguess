import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured',
        tracks: [] 
      }, { status: 200 });
    }

    // YouTube Data API v3 - Search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(query)}&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube API error:', error);
      return NextResponse.json({ 
        error: 'Failed to search YouTube',
        tracks: [] 
      }, { status: 200 });
    }

    const data = await response.json();
    
    const tracks = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.default?.url || item.snippet.thumbnails?.medium?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=0&loop=1&playlist=${item.id.videoId}`,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      tracks: [] 
    }, { status: 500 });
  }
}
