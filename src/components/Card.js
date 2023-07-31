import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

export default function SimpleCard({
  title,
  description,
  buttonText,
  handleButtonClick,
  disabled = false,
  showButton = true,
}) {
  return (
    <Card className="mt-6 w-96">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <Button buttonType="link" onClick={handleButtonClick} disabled={disabled} hidden={!showButton}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
