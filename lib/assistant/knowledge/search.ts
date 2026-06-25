import { findArtistByName } from "./artistes";
import { findNextRelease } from "./sorties";

export async function searchLMGContext(message: string) {
  const words = message.split(" ");

  for (const word of words) {
    const artiste = await findArtistByName(word);

    if (artiste) {
      const sortie = await findNextRelease(artiste.id);

      return {
        artiste,
        sortie,
      };
    }
  }

  return {};
}