import {
  Autocomplete,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { Picture, RoomElementSelectorProps } from '../global/types';
import CloseIcon from '@mui/icons-material/Close';
import { isPicture } from '../global/helper';
import { loadImage, replaceIpfsGateway } from '../global/api';
import { useEffect, useState } from 'react';

const RoomElementSelector = (props: RoomElementSelectorProps) => {
  const [imageBlob, setImageBlob] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    if (typeof props.selectedElement !== 'undefined') {
      setSearchText(props.selectedElement.name);
      if (isPicture(props.selectedElement)) {
        const picture = props.selectedElement as Picture;
        const loadNftImage = async () => {
          const htmlImage = document.createElement('img');
          const url = Array.isArray(picture.image)
            ? picture.image.join('')
            : replaceIpfsGateway(
                picture.image,
                'https://gateway.ipfs.io/ipfs/'
              );

          try {
            await loadImage(htmlImage, url);
            setImageBlob(htmlImage.src);
          } catch (error) {
            setImageBlob('./offline.png');
            props.onError(
              'The image could not be loaded. The ipfs content is probably offline. Please try again later.'
            );
          }
        };
        loadNftImage();
      }
    } else {
      setSearchText('');
      setImageBlob('');
    }
  }, [props.selectedElement]);

  const containsPicture =
    typeof props.selectedElement !== 'undefined' &&
    isPicture(props.selectedElement);

  const containsDoor =
    typeof props.selectedElement !== 'undefined' && !containsPicture;

  let previewText = '';
  if (containsDoor) {
    previewText = 'Door';
  } else if (typeof props.selectedElement === 'undefined') {
    previewText = 'Empty';
  }

  return (
    <Dialog open={props.open} fullScreen>
      <DialogTitle sx={{ textAlign: 'center' }}>Change Slot</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Grid container>
          <Grid
            item
            xs={12}
            container
            sx={{ flexDirection: 'column', alignItems: 'center' }}
          >
            <Grid
              item
              container
              sx={{ alignItems: 'center', width: 'min(90%, 600px)' }}
            >
              <Grid
                item
                container
                xs={12}
                sm={containsDoor ? 12 : 8}
                sx={{ justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    width: 'min(50vw, 300px)',
                    height: 'min(50vw, 300px)',
                    backgroundColor: containsPicture ? 'transparent' : 'gray',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  {containsPicture && (
                    <img
                      src={imageBlob}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      alt="Selected Element"
                    />
                  )}

                  <Typography variant="h6" color="white">
                    {previewText}
                  </Typography>
                </Box>
              </Grid>
              {!containsDoor && (
                <Grid
                  item
                  container
                  xs={12}
                  sm={4}
                  sx={{ justifyContent: 'center' }}
                >
                  <FormControl>
                    <FormLabel>Ownership Management</FormLabel>
                    <FormHelperText>
                      What should happen if the wallet doesn't own the NFT
                      anymore?
                    </FormHelperText>
                    <RadioGroup defaultValue="random">
                      <FormControlLabel
                        value="random"
                        control={<Radio />}
                        label="Transform to Random Slot"
                      />
                      <FormControlLabel
                        value="empty"
                        control={<Radio />}
                        label="Keep Slot Empty"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <Grid item sx={{ mt: 2, mb: 2, width: 'min(90%, 600px)' }}>
              <Autocomplete
                value={searchText}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') {
                    setSearchText(newValue);
                    const element = props.roomElements.find(
                      (element) => element.name === newValue
                    );
                    if (typeof element !== 'undefined') {
                      props.onSelect(element, props.position);
                    }
                  }
                }}
                options={props.roomElements.map((option) => option.name)}
                renderInput={(params: TextFieldProps) => (
                  <TextField {...params} label="Selected Element" />
                )}
              />
            </Grid>
            <Grid item sx={{ width: 'min(90%, 600px)' }}>
              <Typography variant="body1">
                {typeof props.selectedElement !== 'undefined'
                  ? isPicture(props.selectedElement)
                    ? props.selectedElement.description
                    : 'A door to enter the next room or to leave the gallery'
                  : 'Select an element to place in the slot.'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default RoomElementSelector;
