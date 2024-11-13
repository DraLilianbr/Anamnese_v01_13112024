/**
 * Integração com a API do YouTube
 * Responsável por buscar informações de vídeos e validar IDs
 */

import { z } from 'zod';

// Schema de validação da resposta da API do YouTube
const videoSchema = z.object({
  items: z.array(z.object({
    snippet: z.object({
      title: z.string(),
      description: z.string().optional(),
      thumbnails: z.object({
        default: z.object({
          url: z.string()
        }).optional()
      }).optional()
    })
  }))
});

// Chave da API do YouTube (em produção, deve ser uma variável de ambiente)
const YOUTUBE_API_KEY = 'AIzaSyCfVP1cBqFQjdVgkjyBe1wz9xjm25O-alA';

/**
 * Busca informações de um vídeo do YouTube
 * @param videoId ID do vídeo do YouTube
 * @returns Objeto com título, descrição e thumbnail do vídeo
 */
export async function getYouTubeVideoInfo(videoId: string) {
  try {
    // Faz requisição à API do YouTube
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    // Valida resposta usando Zod
    const parsed = videoSchema.parse(data);
    
    if (parsed.items.length === 0) {
      throw new Error('Video not found');
    }

    // Retorna dados formatados
    return {
      title: parsed.items[0].snippet.title,
      description: parsed.items[0].snippet.description || '',
      thumbnail: parsed.items[0].snippet.thumbnails?.default?.url
    };
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    return {
      title: 'Título não disponível',
      description: 'Descrição não disponível',
      thumbnail: ''
    };
  }
}