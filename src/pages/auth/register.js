import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Alert } from "@material-tailwind/react";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import app from "@/firebase_app";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import addUserToFirestore from "@/utils/addNewUser";

export default function Signup() {
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [alertDisplay, setAlertDisplay] = useState({
    open: false,
    message: "",
  });

  const handleChanges = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const signInWithGoogle = () => {
    try {
      signInWithPopup(auth, provider, browserPopupRedirectResolver)
        .then((result) => {
          console.log(result);
          // This gives you a Google Access Token. You can use it to access the Google API.
          // const credential = GoogleAuthProvider.credentialFromResult(result);
          // console.log(credential);

          // The signed-in user info.
          const user = result.user;

          addUserToFirestore(user, app);

          // Redirect to the dashboard
        })
        .catch((error) => {
          console.log(error);
          // Handle Errors here.
          // const errorCode = error.code;
          // const errorMessage = error.message;
          setAlertDisplay({
            open: true,
            message: error.message,
          });

          // sert timeout to hide the alert
          setTimeout(() => {
            setAlertDisplay({
              open: false,
              message: "",
            });
          }, 3000);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const signInWithUserAndPassword = () => {
    console.log(user);
    const email = user.email;
    const password = user.password;
    const name = user.name;

    if (email === undefined || password === undefined || name === undefined) {
      setAlertDisplay({
        open: true,
        message: `Please fill all the fields,
        Following field is missing: ${email === undefined ? "Email" : ""}
        ${password === undefined ? "Password" : ""}
        ${name === undefined ? "Name" : ""}
        `,
      });
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const newUser = userCredential.user;
        // console.log(newUser);

        const username = name;
        // Update the display name of the user
        updateProfile(newUser, { displayName: username })
          .then(() => {
            // Update successful
            console.log("Username set successfully");
          })
          .catch((error) => {
            // Error updating the display name
            console.log("Error setting username:", error);
          });

        addUserToFirestore(newUser, app);
      })
      .catch((error) => {
        console.log(error);
        setAlertDisplay({
          open: true,
          message: error.message,
        });
      });
  };

  useEffect(() => {
    // check if the user is already logged in
    // if yes then redirect to the dashboard
    // else show the login page
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
  }, []);

  return (
    <div className="bg-[#EFF6FF] p-1">
      <Alert
        color="red"
        variant="gradient"
        open={alertDisplay.open}
        onClose={() => setAlertDisplay({ open: false, message: "" })}
      >
        <span>{alertDisplay.message}</span>
      </Alert>
      <div className="flex items-center justify-center h-screen bg-[#EFF6FF]">
        <Card color="transparent" shadow={false}>
          <Typography variant="h4" color="blue-gray">
            Sign Up
          </Typography>
          <Typography color="gray" className="mt-1 font-normal">
            Enter your details to register.
          </Typography>
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
            <div className="mb-4 flex flex-col gap-6">
              <Input
                size="lg"
                label="Name"
                spellCheck={true}
                onChange={handleChanges}
                name="name"
              />
              <Input
                size="lg"
                label="Email"
                spellCheck={true}
                onChange={handleChanges}
                name="email"
              />
              <Input
                type="password"
                size="lg"
                label="Password"
                onChange={handleChanges}
                name="password"
              />
            </div>
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  I agree the
                  <a
                    href="#"
                    className="font-medium transition-colors hover:text-blue-500"
                  >
                    &nbsp;Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button
              className="mt-6"
              fullWidth
              shadow="none"
              color="blue"
              onClick={signInWithUserAndPassword}
            >
              Register
            </Button>
            <div className="flex items-center justify-center mt-6">
              <div className="w-36 h-px bg-gray-300"></div>
              <Typography color="gray" className="mx-4">
                Or
              </Typography>
              <div className="w-36 h-px bg-gray-300"></div>
            </div>
            <Button
              size="lg"
              variant="outlined"
              fullWidth
              color="blue-gray"
              className="flex items-center gap-3 justify-center mt-6"
              onClick={signInWithGoogle}
            >
              <img src="/google.png" alt="metamask" className="h-6 w-6" />
              Continue with Google
            </Button>
            <Typography color="gray" className="mt-6 text-center font-normal">
              By registering, you agree to our{" "}
              <a
                href="#"
                className="font-medium text-blue-500 transition-colors hover:text-blue-700"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium text-blue-500 transition-colors hover:text-blue-700"
              >
                Privacy Policy
              </a>
              .
            </Typography>
            <Typography color="gray" className="mt-4 text-center font-normal">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-500 transition-colors hover:text-blue-700"
              >
                Sign In
              </Link>
            </Typography>
          </form>
        </Card>
      </div>
    </div>
  );
}
