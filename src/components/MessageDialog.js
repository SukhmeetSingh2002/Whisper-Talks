import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function MessageDialog({ open, setOpen, handleSendReply }) {
  const handleOpen = () => setOpen(!open);
  //   message sate using react hook
  const [message, setMessage] = useState("");

  const handleOnChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    console.log(message);
    handleSendReply(message);
    handleOpen(); // Close the dialog after sending the message
  };

  return (
    <React.Fragment>
      <Dialog open={open} handler={handleOpen}>
        <div className="flex items-center justify-between">
          <DialogHeader>New message to @</DialogHeader>
          <XMarkIcon className="mr-3 h-5 w-5" onClick={handleOpen} />
        </div>
        <DialogBody divider>
          <div className="grid gap-6">
            {/* <Input label="Username" /> */}
            <Textarea label="Message" value={message} onChange={handleOnChange} />
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="red" onClick={handleOpen}>
            Close
          </Button>
          <Button variant="gradient" color="green" onClick={handleSendMessage}>
            Send Message
          </Button>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
