import Image from "next/image";
import { FC } from "react";
import { Plant } from "../../types/plant";
import { getMediaItem } from "../../services/browser/photosLibraryService";
import { useQuery } from "react-query";
import { hourMS, minMS } from "../../constants";
import { MediaItem } from "../../types/google";

export interface PlantImageProps {
  plant: Plant;
}
export const PlantImage: FC<PlantImageProps> = (props) => {
  // const queryClient = useQueryClient();

  const getPlantImage = async () => {
    const item = await getMediaItem(props.plant.mediaItemId);
    return item;
  };

  const q = useQuery<MediaItem>(props.plant.slug, getPlantImage, {
    staleTime: hourMS - minMS * 5,
    retry: 0,
  });

  if (!q.data?.mediaMetadata || !q.data?.baseUrl) {
    // maybe server failed to load image?
    // not sure if this is right pattern
    // queryClient.invalidateQueries(props.plant.slug);
    return (
      <div className="h-[256px] w-[256px] rounded-md bg-gray-200 p-5"></div>
    );
  }

  return (
    <Image
      draggable={false}
      width={parseInt(q.data.mediaMetadata.width)}
      height={parseInt(q.data.mediaMetadata.height)}
      className="h-[256px] w-[256px] object-contain"
      src={q.data.baseUrl}
      alt={props.plant.plantName}
    />
  );
};
