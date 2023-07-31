import React from "react";
import {
  Drawer,
  Button,
  Typography,
  IconButton,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
 
export default function MessageBox({ email, subject, message, setMessage, isMessageDisabled,className }) {

    const onChange = ({ target }) => setMessage(target.value);
 
  return (
    <div className={`flex flex-col items-center justify-center w-full my-10 ${className}`}>
        <div className="mb-2 ">
          <Typography variant="h5" color="blue-gray">
            Send Message
          </Typography>
        </div>
        <form className="flex flex-col gap-6 p-4 w-1/2">
          <Input type="email" label="Email" value={email} disabled />
          {/* <Input label="Subject" value={subject} /> */}
          <Textarea rows={6} label="Message" value={message} onChange={onChange} disabled={isMessageDisabled} spellCheck/>
        </form>
    </div>
  );
}