import ComplexNavbar from "@/components/Navbar";
import { Alert } from "@material-tailwind/react";
import Head from "next/head";

import app from "@/firebase_app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SimpleCard from "@/components/Card";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function Whisper() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  const [alertDisplay, setAlertDisplay] = useState({
    open: false,
    message: "",
  });

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
              // check if the sender matches the user's email
              if (whisper.sender === user.email) {
                // if so, then set the whisper state
                setWhisper(whisper);
              } else {
                // else, show an error message
                setAlertDisplay({
                  open: true,
                  message: "You are not the sender of this whisper.",
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
            title={`You sent a whisper to ${whisper?.email}`}
            description={`Message: ${whisper?.message}`}
            buttonText="Send New Whisper"
            handleButtonClick={() => router.push("/whisper/new")}
          />
          {whisper?.isReplied && (
            <SimpleCard
              title={`Reply from ${whisper?.reply?.sender}`}
              description={`Message: ${whisper?.reply?.message}`}
              buttonText="Reply"
              handleButtonClick={() => router.push("/whisper/new")}
              showButton={false}
            />
          )}
        </main>
      </div>
    </>
  );
}
