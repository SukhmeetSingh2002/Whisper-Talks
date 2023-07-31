import ComplexNavbar from "@/components/Navbar";
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Textarea,
} from "@material-tailwind/react";
import Head from "next/head";

import app from "@/firebase_app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SimpleCard from "@/components/Card";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Input } from "postcss";
import MessageDialog from "@/components/MessageDialog";
import Example from "@/components/AlertDialog";

export default function Whisper() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  const [alertDisplay, setAlertDisplay] = useState({
    open: false,
    message: "",
  });

  // state for the reply dialog
  const [open, setOpen] = useState(false);

  // state for the whisper
  const [whisper, setWhisper] = useState({
    receiverEmail: "",
    message: "",
    sender: "",
    senderDetails: "",
    timestamp: "",
    isRead: false,
    isReplied: false,
    reply: {
      message: "",
      sender: "",
      timestamp: "",
    },
  });

  // send reply
  const handleSendReply = (message) => {
    // check if message is empty
    if (message.trim() === "") {
      setAlertDisplay({
        open: true,
        message: "Message cannot be empty.",
      });
      return;
    }

    // check if already replied
    if (whisper.isReplied) {
      setAlertDisplay({
        open: true,
        message: "You have already replied to this whisper.",
      });
      return;
    }

    // update the whisper
    const db = getFirestore(app);
    const whisperRef = doc(db, "whispers", router.query.id);
    const whisperData = {
      isRead: true,
      isReplied: true,
      reply: {
        message: message,
        sender: user.email,
        timestamp: serverTimestamp(),
      },
    };
    updateDoc(whisperRef, whisperData)
      .then(() => {
        console.log("Document successfully updated!");
        setOpen(false);
        setWhisper((prevState) => ({
          ...prevState,
          ...whisperData,
        }));
        setAlertDisplay({
          open: true,
          message: "Reply sent.",
        });
      })
      .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);

        setAlertDisplay({
          open: true,
          message: "Error sending reply.",
        });
      });
  };

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

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        if (!router.query.id) {
          return;
        }
        // query /whispers collection and get the DOC with the ID of router.query.id
        const db = getFirestore(app);
        const whisperRef = doc(db, "whispers", router.query.id);
        getDoc(whisperRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              console.log("Document data:", docSnap.data());
              const whisper = docSnap.data();
              // check if the receiverEmail is the same as the user's email
              if (whisper.email === user.email) {
                // if so, then set the whisper state

                // if email is in senderDetails
                if (
                  !whisper.senderDetailsType.toLowerCase().includes("email")
                ) {
                  const data = whisper;
                  data.sender = "Anonymous";
                  setWhisper(data);
                } else {
                  setWhisper(whisper);
                }
              } else {
                // else, show an error message
                setAlertDisplay({
                  open: true,
                  message: "You are not the recipient of this whisper.",
                });
              }
            } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
              setAlertDisplay({
                open: true,
                message: "Whisper not found.",
              });
            }
          })
          .catch((error) => {
            console.log("Error getting document:", error);
            setAlertDisplay({
              open: true,
              message: "Error getting document.",
            });
          });
      }
    });
  }, [router.query.id]);

  // update is read
  useEffect(() => {
    if (!router.query.id) {
      return;
    }
    if (!whisper.isRead) {
      // query /whispers collection and get the DOC with the ID of router.query.id
      const db = getFirestore(app);
      const whisperRef = doc(db, "whispers", router.query.id);
      const whisperData = {
        isRead: true,
      };
      updateDoc(whisperRef, whisperData)
        .then(() => {
          console.log("Document successfully updated!");
          setWhisper((prevState) => ({
            ...prevState,
            isRead: true,
          }));
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    }
  }, [router.query.id, whisper.isRead]);
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
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
          <SimpleCard
            title={`You received a whisper from ${whisper?.sender}`}
            description={`Message: ${whisper?.message}`}
            buttonText="Reply"
            handleButtonClick={() => setOpen(true)}
            disabled={whisper?.isReplied}
          />
          {whisper?.isReplied && (
            <SimpleCard
              title={`Your reply`}
              description={`Message: ${whisper?.reply?.message}`}
              buttonText="Reply"
              handleButtonClick={() => router.push("/whisper/new")}
              showButton={false}
            />
          )}

          {/* Dialog */}

          <MessageDialog
            open={open}
            setOpen={setOpen}
            handleSendReply={handleSendReply}
          />
        </main>
      </div>
    </>
  );
}
