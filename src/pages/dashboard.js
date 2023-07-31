import MessageBox from "@/components/MessageBox";
import ComplexNavbar from "@/components/Navbar";
import Table from "@/components/Table";
import app from "@/firebase_app";
import { Card, Typography } from "@material-tailwind/react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const [whispersSent, setWhispersSent] = useState([]);
  const [whispersReceived, setWhispersReceived] = useState([]);

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
    const fetchWhispersSent = async () => {
      const db = getFirestore(app);
      const q = query(
        collection(db, "whispers"),
        where("sender", "==", user.email)
      );
      const querySnapshot = await getDocs(q);

      const fetchRecipientDetails = async (recipientRef, doc) => {
        try {
          const docRef = await getDoc(recipientRef);
          if (docRef.exists()) {
            const timestamp = doc.data().timestamp;
            const date = new Date(timestamp.seconds * 1000);

            return {
              whisperId: doc.id,
              recipientEmail: docRef.data().email,
              recipientName: docRef.data().name,
              recipientProfilePic: docRef.data().photoURL,
              senderDetailsType: doc.data().senderDetailsType,
              timestamp: date,
              isRead: doc.data().isRead,
              isReplied: doc.data().isReplied,
            };
          } else {
            const timestamp = doc.data().timestamp;
            const date = new Date(timestamp.seconds * 1000);

            return {
              whisperId: doc.id,
              recipientEmail: doc.data().email,
              senderDetailsType: doc.data().senderDetailsType,
              timestamp: date,
              isRead: doc.data().isRead,
              isReplied: doc.data().isReplied,
            };
          }
        } catch (error) {
          console.log("Error getting document:", error);
          const timestamp = doc.data().timestamp;
          const date = new Date(timestamp.seconds * 1000);

          return {
            whisperId: doc.id,
            recipientEmail: doc.data().email,
            senderDetailsType: doc.data().senderDetailsType,
            timestamp: date,
            isRead: doc.data().isRead,
            isReplied: doc.data().isReplied,
          };
        }
      };

      const whispers = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const recipientRef = doc.data().recipientRef;
          const recipientDetails = await fetchRecipientDetails(
            recipientRef,
            doc
          );
          return recipientDetails;
        })
      );

      console.log("All whispers sent: ", whispers);

      setWhispersSent(whispers);
    };

    const handleAuthStateChanged = (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
      }
    };

    if (user?.email) {
      try {
        fetchWhispersSent();
      } catch (error) {
        console.log(error);
      }
    }
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    return () => {
      unsubscribe();
    };
  }, [user?.email]);

  useEffect(() => {
    const fetchWhispersReceived = async () => {
      const db = getFirestore(app);
      const q = query(
        collection(db, "whispers"),
        where("email", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);

      const whispers = querySnapshot.docs.map((doc) => {
        const senderDetailsType = doc.data().senderDetailsType;
        const date = new Date(doc.data().timestamp.seconds * 1000);

        const whisper = {
          whisperId: doc.id,
          senderDetailsType,
          timestamp: date,
          isRead: doc.data().isRead,
          isReplied: doc.data().isReplied,
        };

        if (senderDetailsType === "emailOnly") {
          whisper.senderEmail = doc.data().sender;
        } else if (senderDetailsType === "nameOnly") {
          whisper.senderName = doc.data().senderName;
        } else if (senderDetailsType === "nameEmail") {
          whisper.senderEmail = doc.data().sender;
          whisper.senderName = doc.data().senderName;
          whisper.senderProfilePic = doc.data().senderProfilePic;
        }

        return whisper;
      });

      setWhispersReceived(whispers);
    };

    if (user?.email) {
      try {
        fetchWhispersReceived();
      } catch (error) {
        console.log(error);
      }
    }
  }, [user]);

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

      {/* <Table /> */}
      {/* wrap the table in a div* */}
      <div className="flex flex-col items-center justify-center mx-32 my-10">
        <Table
          // handleNewWhisper={() => router.push("/whisper/new")}
          handleRefresh={() => {
            router.reload();
          }}
          handleNewWhisper={() => {
            if (!document.startViewTransition) {
              router.push("/whisper/new");
              return;
            }

            document.startViewTransition(() => router.push("/whisper/new"));
          }}
          rowData={whispersSent}
          // handleRowClick={(email) => router.push(`/whisper/${email}`)}
          handleRowClick={(email, value) => {
            // alert(document.startViewTransition)
            if (value === "sent") {
              if (!document.startViewTransition) {
                router.push(`/whisper/${email}`);
                return;
              }

              // document.startViewTransition(() => updateTheDOMSomehow(data))
              // router.push(`/whisper/${email}`);

              document.startViewTransition(() =>
                router.push(`/whisper/${email}`)
              );
            } else {
              // router.push(`/whisper/reply/${email}`);
              if (!document.startViewTransition) {
                router.push(`/whisper/reply/${email}`);
                return;
              }

              document.startViewTransition(() =>
                router.push(`/whisper/reply/${email}`)
              );
            }
          }}
          secondPanelRowData={whispersReceived}
        />
      </div>
    </>
  );
}
