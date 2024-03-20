import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { RoomElementSelectorProps } from '../global/types';

const RoomElementSelector = (props: RoomElementSelectorProps) => {
  return (
    <Dialog open={props.open} fullScreen>
      <DialogTitle>Change Slot</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h6">
              {props.selectedElement
                ? props.selectedElement.name
                : 'Empty Slot'}
            </Typography>
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={props.roomElements.map((option) => option.name)}
              renderInput={(params: TextFieldProps) => (
                <TextField {...params} label="freeSolo" />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomElementSelector;
