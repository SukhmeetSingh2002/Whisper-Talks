import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export function SimpleDialog({
  buttonText,
  dialogTitle,
  dialogContent,
  handleConfirm,
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  const handleConfirmWrapper = () => {
    handleOpen();
    handleConfirm();
  };

  return (
    <Fragment>
      <Button fullWidth onClick={handleOpen} variant="gradient">
        {buttonText}
      </Button>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{dialogTitle}</DialogHeader>
        <DialogBody divider>{dialogContent}</DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleConfirmWrapper}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}
