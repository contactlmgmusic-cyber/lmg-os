import "server-only";

type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  images: SpotifyImage[];
};

export type SpotifyRelease = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
  images: SpotifyImage[];
};

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifySearchResponse = {
  artists: {
    items: SpotifyArtist[];
  };
};

type SpotifyReleasesResponse = {
  items: SpotifyRelease[];
  next: string | null;
};

let cachedAccessToken: string | null = null;
let accessTokenExpiresAt = 0;

function getSpotifyCredentials() {
  const clientId =
    process.env.SPOTIFY_CLIENT_ID;

  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Identifiants Spotify manquants."
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

async function getSpotifyAccessToken() {
  if (
    cachedAccessToken &&
    Date.now() < accessTokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  const {
    clientId,
    clientSecret,
  } = getSpotifyCredentials();

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization:
          `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type:
          "client_credentials",
      }),
      cache: "no-store",
    }
  );

  const result =
    (await response.json()) as
      | SpotifyTokenResponse
      | {
          error?: string;
          error_description?: string;
        };

  if (
    !response.ok ||
    !("access_token" in result)
  ) {
    const errorMessage =
      "error_description" in result
        ? result.error_description
        : null;

    throw new Error(
      errorMessage ||
        "Impossible de récupérer le jeton Spotify."
    );
  }

  cachedAccessToken =
    result.access_token;

  accessTokenExpiresAt =
    Date.now() +
    Math.max(
      result.expires_in - 60,
      60
    ) *
      1000;

  return cachedAccessToken;
}

async function spotifyFetch<T>(
  endpoint: string
): Promise<T> {
  const accessToken =
    await getSpotifyAccessToken();

  const response = await fetch(
    endpoint.startsWith("http")
      ? endpoint
      : `https://api.spotify.com/v1${endpoint}`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => null);

    const message =
      result?.error?.message ||
      result?.error_description ||
      `Erreur Spotify ${response.status}.`;

    if (response.status === 401) {
      cachedAccessToken = null;
      accessTokenExpiresAt = 0;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function extractSpotifyArtistId(
  value: string
) {
  const cleanValue = value.trim();

  if (
    /^[a-zA-Z0-9]{22}$/.test(
      cleanValue
    )
  ) {
    return cleanValue;
  }

  const uriMatch = cleanValue.match(
    /^spotify:artist:([a-zA-Z0-9]{22})$/
  );

  if (uriMatch) {
    return uriMatch[1];
  }

  try {
    const url = new URL(cleanValue);

    if (
      url.hostname ===
        "open.spotify.com" ||
      url.hostname.endsWith(
        ".spotify.com"
      )
    ) {
      const segments =
        url.pathname
          .split("/")
          .filter(Boolean);

      const artistIndex =
        segments.indexOf("artist");

      const artistId =
        artistIndex >= 0
          ? segments[
              artistIndex + 1
            ]
          : null;

      if (
        artistId &&
        /^[a-zA-Z0-9]{22}$/.test(
          artistId
        )
      ) {
        return artistId;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function getSpotifyArtist(
  artistId: string
) {
  return spotifyFetch<SpotifyArtist>(
    `/artists/${encodeURIComponent(
      artistId
    )}`
  );
}

export async function searchSpotifyArtists(
  query: string
) {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return [];
  }

  const result =
    await spotifyFetch<SpotifySearchResponse>(
      `/search?type=artist&limit=10&q=${encodeURIComponent(
        cleanQuery
      )}`
    );

  return result.artists.items || [];
}

export async function getSpotifyArtistReleases(
  artistId: string
) {
  const releases:
    SpotifyRelease[] = [];

  let nextUrl: string | null =
    `/artists/${encodeURIComponent(
      artistId
    )}/albums?limit=10`;

  while (nextUrl) {
    const result:
      SpotifyReleasesResponse =
      await spotifyFetch<SpotifyReleasesResponse>(
        nextUrl
      );

    releases.push(
      ...(result.items || [])
    );

    nextUrl = result.next;
  }

  const uniqueReleases =
    Array.from(
      new Map(
        releases.map((release) => [
          release.id,
          release,
        ])
      ).values()
    );

  return uniqueReleases;
}