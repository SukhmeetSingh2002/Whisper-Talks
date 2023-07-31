import MessageBox from "@/components/MessageBox";
import ComplexNavbar from "@/components/Navbar";
import app from "@/firebase_app";
import { Alert, Card, Dialog, Typography } from "@material-tailwind/react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { HomeIcon, CogIcon, UserIcon } from "@heroicons/react/24/outline";
import { Stepper, Step, Button } from "@material-tailwind/react";
import EmailSearch from "@/components/EmailSearch";
import { SimpleDialog } from "@/components/Dialog";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  const [profileDisplay, setProfileDisplay] = useState("");
  const profileDisplayOptions = {
    anonymous: "You will be anonymous",
    nameEmail: "Your name and email will be shown",
    nameOnly: "Only your name will be shown to the recipient",
    emailOnly: "Only your email will be shown to the recipient",
  };

  const [whisperEmail, setWhisperEmail] = useState("");
  const [whisperMessage, setWhisperMessage] = useState("Hi, I want to say...");
  const [isWhisperFound, setIsWhisperFound] = useState(false);
  const [whisperUserRef, setWhisperUserRef] = useState(null);

  const [alertDisplay, setAlertDisplay] = useState({
    open: false,
    message: "",
  });

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        router.push("/auth/login");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const handleSearchEmail = async (email) => {
    // verify email using regex
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setAlertDisplay({
        open: true,
        message: "Please enter a valid email address",
      });
      setWhisperEmail("");
      setIsWhisperFound(false);
      setWhisperUserRef(null);
      return;
    }
    // check if email is in database
    // if email is in database, set the email state
    // if email is not in database, display error message

    // now query the firestore database
    const db = getFirestore(app);
    const whisperRef = collection(db, "users");
    const my_query = query(whisperRef, where("email", "==", email));
    const querySnapshot = await getDocs(my_query);
    if (querySnapshot.empty) {
      setAlertDisplay({
        open: true,
        message:
          "User is not on WhisperTalks but we will send them an email to join :) ",
      });
      setWhisperEmail(email);
      setIsWhisperFound(false);
      setWhisperUserRef(null);
    } else {
      // email found
      setAlertDisplay({
        open: true,
        message: "User found! You can now send them a whisper",
      });
      setWhisperEmail(email);
      setIsWhisperFound(true);
      setWhisperUserRef(querySnapshot.docs[0].ref);
    }
  };

  const handleSendWhisper = async () => {
    // send whisper to database
    // if successful, display success message
    // if not successful, display error message
    if (!profileDisplay) {
      setAlertDisplay({
        open: true,
        message: "Please select a profile display option",
      });
      return;
    }
    if (!whisperEmail) {
      setAlertDisplay({
        open: true,
        message: "Please enter a valid email address",
      });
      return;
    }
    const db = getFirestore(app);
    const whisperRef = collection(db, "whispers");
    const whisperDoc = await addDoc(whisperRef, {
      email: whisperEmail,
      message: whisperMessage,
      recipientRef: whisperUserRef,
      sender: user.email,
      senderDetailsType: profileDisplay,
      senderName: user.displayName,
      senderProfilePic: user.photoURL,
      timestamp: serverTimestamp(),
    });
    setAlertDisplay({
      open: true,
      message: "Whisper sent successfully!",
    });
    setWhisperEmail("");
    setWhisperMessage("Hi, I want to say...");
    setIsWhisperFound(false);
    setWhisperUserRef(null);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
      }
    });
  }, []);

  const [activeStep, setActiveStep] = React.useState(0);
  const [isLastStep, setIsLastStep] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(false);

  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ComplexNavbar
        name={user?.displayName}
        profileImage={user?.photoURL}
        handleSignOut={handleSignOut}
      />
      <Alert
        color="red"
        variant="gradient"
        open={alertDisplay.open}
        onClose={() => setAlertDisplay({ open: false, message: "" })}
      >
        <span>{alertDisplay.message}</span>
      </Alert>
      {/* <Table /> */}
      {/* wrap the table in a div* */}
      <div className="flex flex-col items-center justify-center mx-32 my-10">
        <div className="w-full py-4 px-8">
          <Stepper
            activeStep={activeStep}
            isLastStep={(value) => setIsLastStep(value)}
            isFirstStep={(value) => setIsFirstStep(value)}
            color="pink"
          >
            <Step onClick={() => setActiveStep(0)}>
              <HomeIcon className="h-5 w-5" />
            </Step>
            <Step onClick={() => setActiveStep(1)}>
              <UserIcon className="h-5 w-5" />
            </Step>
            <Step onClick={() => setActiveStep(2)}>
              <CogIcon className="h-5 w-5" />
            </Step>
          </Stepper>

          {/* Message */}

          {/* <MessageBox email={user?.email} subject={user?.displayName} message={user?.message} /> */}
          {/* if active step is 0, show the emailSearch component */}
          {/* if active step is 1, show the messageBox component */}
          {/* if active step is 2, show the final message and send button */}
          {activeStep === 0 && (
            <div className="flex flex-col items-center justify-center mt-16">
              <EmailSearch handleSearch={handleSearchEmail} />
            </div>
          )}
          {activeStep === 1 && (
            <div className="flex flex-col items-center justify-center">
              <MessageBox
                email={whisperEmail}
                message={whisperMessage}
                setMessage={setWhisperMessage}
              />
            </div>
          )}
          {activeStep === 2 && (
            // give 3/4th of the screen to the message box and 1/4th to the radio button
            // also center them
            <>
              <div className="grid grid-cols-5 gap-4 items-center justify-center">
                <MessageBox
                  email={whisperEmail}
                  message={whisperMessage}
                  isMessageDisabled={true}
                  className="col-span-3"
                />
                <RadioOption
                  name={user?.displayName}
                  email={user?.email}
                  className="col-span-2"
                  setProfileDisplay={setProfileDisplay}
                  profileDisplay={profileDisplay}
                />
                {/* button */}
              </div>
              <SimpleDialog
                buttonText={"Send Your Whisper"}
                dialogTitle={"Confirm Your Whisper"}
                dialogContent={`The whisper will be sent to ${whisperEmail} with the following message:

                ==================

                 ${whisperMessage}
                
                ==================
                ${profileDisplayOptions[profileDisplay]}

                ${
                  isWhisperFound === false
                    ? "Since the user is not yet on Whisper, they will receive an email with a link to the app and 15 characters of your message."
                    : ""
                }

                
                `
                  .split("\n")
                  .map((str) => (
                    <>
                      {str}
                      <br />
                    </>
                  ))}
                handleConfirm={handleSendWhisper}
              />
            </>
          )}

          {/* Buttons */}
          <div className="mt-16 flex justify-between">
            <Button onClick={handlePrev} disabled={isFirstStep}>
              Prev
            </Button>
            <Button onClick={handleNext} disabled={isLastStep}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { Radio } from "@material-tailwind/react";

export function RadioOption({
  name,
  email,
  className,
  setProfileDisplay,
  profileDisplay,
}) {
  const [selectedOption, setSelectedOption] = useState(
    profileDisplay || ""
  );

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setProfileDisplay(option);
  };

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      <Radio
        name="description"
        id="description-html"
        label={
          <div>
            <Typography color="blue-gray" className="font-medium">
              Show Your Name and Email (Profile Picture Included)
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              {name} ({email}) 
            </Typography>
          </div>
        }
        checked={selectedOption === "nameEmail"}
        onChange={() => handleOptionChange("nameEmail")}
        containerProps={{
          className: "-mt-5",
        }}
      />
      <Radio
        name="description"
        id="description-react"
        label={
          <div>
            <Typography color="blue-gray" className="font-medium">
              Show Your Name Only
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              {name}
            </Typography>
          </div>
        }
        checked={selectedOption === "nameOnly"}
        onChange={() => handleOptionChange("nameOnly")}
        containerProps={{
          className: "-mt-5",
        }}
      />
      <Radio
        name="description"
        id="description-react"
        label={
          <div>
            <Typography color="blue-gray" className="font-medium">
              Show Your Email Only
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              {email}
            </Typography>
          </div>
        }
        checked={selectedOption === "emailOnly"}
        onChange={() => handleOptionChange("emailOnly")}
        containerProps={{
          className: "-mt-5",
        }}
      />
      <Radio
        name="description"
        id="description-react"
        label={
          <div>
            <Typography color="blue-gray" className="font-medium">
              {"Don't Show Your Name and Email"}
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Anonymous
            </Typography>
          </div>
        }
        checked={selectedOption === "anonymous"}
        onChange={() => handleOptionChange("anonymous")}
        containerProps={{
          className: "-mt-5",
        }}
      />
    </div>
  );
}
