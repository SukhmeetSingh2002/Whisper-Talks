import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
} from "firebase/firestore";

const addUserToFirestore = async (user, app) => {
  // Add user to Firestore if not already registered
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const userRef = doc(usersCollection, user.uid);

  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    console.log("User already exists in Firestore");
  } else {
    // doc.data() will be undefined in this case
    console.log("User does not exist in Firestore");
    try {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL ?? "",
        uid: user.uid,
      });
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }
};

export default addUserToFirestore;
