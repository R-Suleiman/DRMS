import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
// Mantine
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import { ModalProvider } from "./context/ModalContext";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <MantineProvider defaultColorScheme="auto">
            <AuthProvider>
                <ModalProvider>
                    <ToastContainer />
                    <RouterProvider router={router} />
                </ModalProvider>
            </AuthProvider>
        </MantineProvider>
    </StrictMode>
);
