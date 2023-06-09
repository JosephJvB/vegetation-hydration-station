import { MediaItem, UploadResponse } from "../../types/google";
import { Plant } from "../../types/plant";
import { getAuthCookie } from "./auth";

const baseUrl = "https://photoslibrary.googleapis.com/v1";

export const getMediaItem = async (itemId: string): Promise<MediaItem> => {
  const authToken = getAuthCookie();
  if (!authToken) {
    throw new Error("missing Auth Cookie");
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken}`);
  headers.append("Content-Type", "application/json");

  const res = await fetch(`${baseUrl}/mediaItems/${itemId}`, {
    headers,
  });
  if (!res.ok) {
    throw res;
  }
  return res.json();
};

// https://developers.google.com/photos/library/guides/upload-media

export const uploadFile = async (plant: Plant, file: File) => {
  const authToken = getAuthCookie();
  if (!authToken) {
    throw new Error("missing Auth Cookie");
  }
  const fileName = `${plant.plantName}.${Date.now()}`;

  const uploadToken = await getUploadToken(authToken, fileName, file);
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken}`);
  headers.append("Content-Type", "application/json");
  const res = await fetch(`${baseUrl}/mediaItems:batchCreate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      albumId: plant.albumId,
      newMediaItems: [
        {
          description: `progress photo of ${plant.plantName}`,
          simpleMediaItem: {
            fileName,
            uploadToken,
          },
        },
      ],
    }),
  });

  const results: UploadResponse = await res.json();

  if (!res.ok) {
    throw results;
  }

  if (results.newMediaItemResults[0].status.message !== "Success") {
    throw results.newMediaItemResults[0].status;
  }

  return results.newMediaItemResults[0].mediaItem;
};

const getUploadToken = async (
  authToken: string,
  fileName: string,
  file: File
) => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken}`);
  headers.append("Content-Type", "application/octet-stream");
  headers.append("Content-Length", file.size.toString());
  headers.append("X-Goog-Upload-File-Name", fileName);
  headers.append("X-Goog-Upload-Content-Type", file.type);
  headers.append("X-Goog-Upload-Protocol", "raw");

  const res = await fetch(`${baseUrl}/uploads`, {
    method: "POST",
    headers,
    body: file,
  });

  const token = await res.text();

  if (!res.ok) {
    throw token;
  }

  return token;
};
