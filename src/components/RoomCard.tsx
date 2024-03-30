import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from '@mui/material';
import {
  GalleryRoom,
  Room,
  RoomGenerationType,
  SlotColorCode,
  Slots,
} from '../global/types';
import { useEffect, useRef, useState } from 'react';
import { drawSlots, fromRooms } from '../global/helper';

const RoomCard = ({
  type,
  galleryRoom,
  customizeRoom,
}: {
  type: RoomGenerationType;
  galleryRoom: GalleryRoom;
  customizeRoom?: (galleryRoom: GalleryRoom) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const [preview, setPreview] = useState<string>('');

  const drawRoom = () => {
    if (canvasRef.current) {
      console.log('galleryRoom', galleryRoom);

      const grid = fromRooms(galleryRoom.rooms, 2);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const canvasWidth = 275;
      const canvasHeight = 240;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      if (context && grid.length > 0) {
        context.fillStyle = theme.palette.primary.main;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const gridWidth = grid[0].length;
        const gridHeight = grid.length;
        const margin = Math.min(0.4 * gridWidth, 2);
        const rectWidth = canvas.width / gridWidth - margin;
        const rectHeight = canvas.height / gridHeight - margin;

        for (let i = 0; i < gridHeight; i++) {
          for (let j = 0; j < gridWidth; j++) {
            const x = j * (rectWidth + margin) + margin / 2;
            const y = i * (rectHeight + margin) + margin / 2;

            context.fillStyle = theme.palette.primary.dark;

            const room = galleryRoom.rooms.find(
              (room) => room.row === i - 1 && room.col === j - 1
            );

            if (grid[i][j] === 1) {
              context.fillStyle = 'white';
            } else {
              context.fillStyle = theme.palette.primary.dark;
            }

            context.fillRect(x, y, rectWidth, rectHeight);

            const roomElements = galleryRoom.roomElements.filter(
              (roomElement) =>
                roomElement.position?.col === j - 1 &&
                roomElement.position?.row === i - 1
            );

            const slotColorCode: SlotColorCode = {
              freeSlotColor: theme.palette.success.main,
              occupiedSlotColor: theme.palette.error.light,
              doorColor: theme.palette.warning.light,
            };

            drawSlots(
              room?.slots,
              roomElements,
              x,
              y,
              rectWidth,
              rectHeight,
              context,
              slotColorCode
            );

            setPreview(canvas.toDataURL());
          }
        }
      }
    }
  };

  useEffect(() => {
    drawRoom();
  }, [galleryRoom]);

  let slots = 0;
  for (const room of galleryRoom.rooms) {
    const walls: (keyof Slots)[] = ['top', 'left', 'right', 'bottom'];
    for (const wall of walls) {
      if (wall && room.slots) {
        if (typeof room.slots[wall] !== 'undefined') {
          slots += room.slots[wall]?.reduce((acc, slot) => acc + slot, 0) || 0;
        }
      }
    }
  }

  const customizeGalleryRoom = () => {
    if (typeof customizeRoom === 'function') {
      customizeRoom(galleryRoom);
    }
  };

  return (
    <Card sx={{ width: 275 }}>
      {preview && <CardMedia sx={{ height: 240 }} image={preview} />}
      <CardContent>
        <canvas style={{ display: 'none' }} ref={canvasRef}></canvas>
        {type === RoomGenerationType.RANDOM ? (
          <Typography variant="body2" color="text.secondary">
            Currently, there are <b>{slots} slots</b> available in this{' '}
            <b>randomly generated</b> room.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Currently, there are <b>{slots} slots</b> available in your{' '}
            <b>customized</b> room.
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button size="small" onClick={customizeGalleryRoom}>
          {type === RoomGenerationType.RANDOM ? 'Customize' : 'Edit'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default RoomCard;
