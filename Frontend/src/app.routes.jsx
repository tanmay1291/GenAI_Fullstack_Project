import {createBrowserRouter} from "react-router"
import Login from "./features/Auth/pages/Login.jsx"
import Register from "./features/Auth/pages/Register.jsx"
import Protected from "./features/Auth/components/Protected.jsx"
import Home from "./features/interview/Pages/Home.jsx"
import Interview from "./features/interview/Pages/Interview.jsx"

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>
    },

    {
        path: "/register",
        element: <Register/>
    },

    {
        path : "/",
        element : <Protected><Home/></Protected>
    },

    {
        path : "/interview/:interviewId",
        element : <Protected><Interview/></Protected>
    }
])