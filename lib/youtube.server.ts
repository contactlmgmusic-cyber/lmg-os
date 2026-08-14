import "server-only";

const YOUTUBE_API_BASE_URL =
  "https://www.googleapis.com/youtube/v3";

function getYouTubeApiKey() {
  const apiKey =
    process.env.GOOGLE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "La variable GOOGLE_YOUTUBE_API_KEY est manquante."
    );
  }

  return apiKey;
}

async function youtubeFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const searchParams =
    new URLSearchParams({
      ...params,
      key: getYouTubeApiKey(),
    });

  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/${endpoint}?${searchParams.toString()}`,
    {
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result?.error?.message ||
      "La requête YouTube a échoué.";

    throw new Error(message);
  }

  return result as T;
}

type YouTubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

type YouTubeThumbnails = {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
};

export type YouTubeChannel = {
  id: string;
  title: string;
  description: string;
  customUrl: string | null;
  imageUrl: string | null;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  uploadsPlaylistId: string | null;
  youtubeUrl: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  youtubeUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string | null;
};

type ChannelApiItem = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    thumbnails?: YouTubeThumbnails;
  };
  statistics?: {
    viewCount?: string;
    subscriberCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
};

type ChannelApiResponse = {
  items?: ChannelApiItem[];
};

type SearchChannelItem = {
  id?: {
    channelId?: string;
  };
};

type SearchChannelResponse = {
  items?: SearchChannelItem[];
};

type PlaylistItem = {
  contentDetails?: {
    videoId?: string;
  };
};

type PlaylistItemsResponse = {
  items?: PlaylistItem[];
  nextPageToken?: string;
};

type VideoApiItem = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: YouTubeThumbnails;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
};

type VideosApiResponse = {
  items?: VideoApiItem[];
};

function toNumber(
  value?: string | number | null
) {
  const parsed = Number(value || 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getBestThumbnail(
  thumbnails?: YouTubeThumbnails
) {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    null
  );
}

function normalizeChannel(
  item: ChannelApiItem
): YouTubeChannel {
  return {
    id: item.id,
    title:
      item.snippet?.title ||
      "Chaîne YouTube",
    description:
      item.snippet?.description || "",
    customUrl:
      item.snippet?.customUrl || null,
    imageUrl: getBestThumbnail(
      item.snippet?.thumbnails
    ),
    subscriberCount: toNumber(
      item.statistics?.subscriberCount
    ),
    viewCount: toNumber(
      item.statistics?.viewCount
    ),
    videoCount: toNumber(
      item.statistics?.videoCount
    ),
    uploadsPlaylistId:
      item.contentDetails
        ?.relatedPlaylists?.uploads ||
      null,
    youtubeUrl:
      `https://www.youtube.com/channel/${item.id}`,
  };
}

function normalizeVideo(
  item: VideoApiItem
): YouTubeVideo {
  return {
    id: item.id,
    title:
      item.snippet?.title ||
      "Vidéo YouTube",
    description:
      item.snippet?.description || "",
    publishedAt:
      item.snippet?.publishedAt || null,
    thumbnailUrl: getBestThumbnail(
      item.snippet?.thumbnails
    ),
    youtubeUrl:
      `https://www.youtube.com/watch?v=${item.id}`,
    viewCount: toNumber(
      item.statistics?.viewCount
    ),
    likeCount: toNumber(
      item.statistics?.likeCount
    ),
    commentCount: toNumber(
      item.statistics?.commentCount
    ),
    duration:
      item.contentDetails?.duration ||
      null,
  };
}

export function extractYouTubeChannelId(
  value: string
) {
  const input = value.trim();

  if (/^UC[\w-]{20,}$/i.test(input)) {
    return input;
  }

  try {
    const url = new URL(
      input.startsWith("http")
        ? input
        : `https://${input}`
    );

    const channelMatch =
      url.pathname.match(
        /\/channel\/(UC[\w-]+)/i
      );

    return channelMatch?.[1] || null;
  } catch {
    return null;
  }
}

export function extractYouTubeHandle(
  value: string
) {
  const input = value.trim();

  const directHandle =
    input.match(/^@([\w.-]+)$/);

  if (directHandle) {
    return `@${directHandle[1]}`;
  }

  try {
    const url = new URL(
      input.startsWith("http")
        ? input
        : `https://${input}`
    );

    const handleMatch =
      url.pathname.match(
        /^\/(@[\w.-]+)\/?$/i
      );

    return handleMatch?.[1] || null;
  } catch {
    return null;
  }
}

async function getChannelById(
  channelId: string
) {
  const result =
    await youtubeFetch<ChannelApiResponse>(
      "channels",
      {
        part:
          "snippet,statistics,contentDetails",
        id: channelId,
        maxResults: "1",
      }
    );

  const channel = result.items?.[0];

  return channel
    ? normalizeChannel(channel)
    : null;
}

async function getChannelByHandle(
  handle: string
) {
  const normalizedHandle =
    handle.startsWith("@")
      ? handle
      : `@${handle}`;

  const result =
    await youtubeFetch<ChannelApiResponse>(
      "channels",
      {
        part:
          "snippet,statistics,contentDetails",
        forHandle: normalizedHandle,
        maxResults: "1",
      }
    );

  const channel = result.items?.[0];

  return channel
    ? normalizeChannel(channel)
    : null;
}

async function searchChannel(
  query: string
) {
  const searchResult =
    await youtubeFetch<SearchChannelResponse>(
      "search",
      {
        part: "snippet",
        type: "channel",
        q: query,
        maxResults: "1",
      }
    );

  const channelId =
    searchResult.items?.[0]?.id
      ?.channelId;

  if (!channelId) {
    return null;
  }

  return getChannelById(channelId);
}

export async function resolveYouTubeChannel(
  value: string
) {
  const input = value.trim();

  if (!input) {
    throw new Error(
      "Renseigne une chaîne YouTube."
    );
  }

  const channelId =
    extractYouTubeChannelId(input);

  if (channelId) {
    const channel =
      await getChannelById(channelId);

    if (channel) {
      return channel;
    }
  }

  const handle =
    extractYouTubeHandle(input);

  if (handle) {
    const channel =
      await getChannelByHandle(handle);

    if (channel) {
      return channel;
    }
  }

  const channel =
    await searchChannel(input);

  if (!channel) {
    throw new Error(
      "Aucune chaîne YouTube correspondante n’a été trouvée."
    );
  }

  return channel;
}

async function getUploadVideoIds(
  uploadsPlaylistId: string,
  maximumVideos: number
) {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (
    videoIds.length < maximumVideos
  ) {
    const remaining =
      maximumVideos - videoIds.length;

    const result =
      await youtubeFetch<PlaylistItemsResponse>(
        "playlistItems",
        {
          part: "contentDetails",
          playlistId:
            uploadsPlaylistId,
          maxResults: String(
            Math.min(remaining, 50)
          ),
          ...(pageToken
            ? {
                pageToken,
              }
            : {}),
        }
      );

    for (
      const item of result.items || []
    ) {
      const videoId =
        item.contentDetails?.videoId;

      if (videoId) {
        videoIds.push(videoId);
      }
    }

    if (
      !result.nextPageToken ||
      !result.items?.length
    ) {
      break;
    }

    pageToken =
      result.nextPageToken;
  }

  return videoIds.slice(
    0,
    maximumVideos
  );
}

export async function getYouTubeChannelVideos(
  channel: YouTubeChannel,
  maximumVideos = 50
) {
  if (!channel.uploadsPlaylistId) {
    return [];
  }

  const videoIds =
    await getUploadVideoIds(
      channel.uploadsPlaylistId,
      maximumVideos
    );

  if (videoIds.length === 0) {
    return [];
  }

  const videos: YouTubeVideo[] = [];

  for (
    let index = 0;
    index < videoIds.length;
    index += 50
  ) {
    const batch =
      videoIds.slice(
        index,
        index + 50
      );

    const result =
      await youtubeFetch<VideosApiResponse>(
        "videos",
        {
          part:
            "snippet,statistics,contentDetails",
          id: batch.join(","),
          maxResults: "50",
        }
      );

    videos.push(
      ...(result.items || []).map(
        normalizeVideo
      )
    );
  }

  return videos.sort((a, b) => {
    return (
      new Date(
        b.publishedAt || 0
      ).getTime() -
      new Date(
        a.publishedAt || 0
      ).getTime()
    );
  });
}