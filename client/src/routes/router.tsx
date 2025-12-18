import { createBrowserRouter } from "react-router-dom";
import Calendar from "../pages/Calendar/Calendar";
import Festival from "../pages/Festival/Festival";
import FestivalDetails from "../pages/Festival/FestivalDetails/FestivalDetails";
import HomePage from "../pages/Home/HomePage";
import HomeScreent from "../pages/HomeScreent/HomeScreent";
import InforPage from "../pages/NewsPage/InforPage/InforPage";
import NewsPage from "../pages/NewsPage/NewsPage";
import PromotionsPage from "../pages/Promotions/PromotionsPage";
import TicketPricing from "../pages/TicketPrice/TicketPricing";
import AdminLayout from "../pages/Admin/AdminLayout";
import BookingManager from "../pages/Admin/BookingManager";
import Dashboard from "../pages/Admin/Dashboard";
// import FestivalManager from "../pages/Admin/FestivalManager";
import MovieManager from "../pages/Admin/MovieManager";
import NewsManager from "../pages/Admin/NewsManager";

// import TicketPriceManager from "../pages/Admin/TicketPriceManager";

import AdminGuard from "./AdminGuard";
import TicketPriceManager from "../pages/Admin/TickerPriceManager/TicketPriceManager";
import FestivalManager from "../pages/Admin/FestivalManager/FestivalManager";
import UserManager from "../pages/Admin/UserManager/UserManager";
import PromotionManager from "../pages/Admin/PromotionsManager/PromotionsManager";
import BookmarkButton from "../components/bookMark/BookmarkButton";
import ShowtimeManager from "../pages/Admin/ShowtimeManager/ShowtimeManager";
import MovieDetail from "../pages/MovieDetail/MovieDetail";
import Payment from "../pages/MovieDetail/Payment/Payment";
import PaymentSuccess from "../pages/MovieDetail/Payment/PaymentSuccess/PaymentSuccess";
import ProfileLayout from "../pages/Profile/ProfileLayout";
import ProfileUpdate from "../pages/Profile/ProfileUpdate";
import PromotionDetailPage from "../pages/Promotions/PromotionDetail/PromotionDetailPage";
import HistoryPayment from "../pages/Profile/HistoryPayment";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreent />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "pricing", element: <TicketPricing /> },
      { path: "promotion", element: <PromotionsPage /> },
      {
        path: "/promotions/:id",
        element: <PromotionDetailPage />,
      },
      { path: "festival", element: <Festival /> },
      { path: "festivalDetail/:id", element: <FestivalDetails /> },
      { path: "newpage", element: <NewsPage /> },
      { path: "news/:id", element: <InforPage /> },
      { path: "calendar", element: <Calendar /> },
      {
        path: "bookmarks",
        element: <BookmarkButton movieId={1} size={20} />
      },
      {
        path: "movieDetail/:id",
        element: <MovieDetail/>
      },
      { 
        path:"payment",
        element: <Payment/>
      },
      {
        path:"payment-success",
        element:<PaymentSuccess/>
      },
      {
        path: "/profile",
        element: <ProfileLayout />,
        children: [
          { index: true, element: <ProfileUpdate /> },
          { path: "historyPayment", element: <HistoryPayment/> },

          { path: "points", element: <div>Points</div> },
        ],
      },
    ],
  },


  {
    element: <AdminGuard />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "movies", element: <MovieManager /> },
          { path: "users", element: <UserManager /> },
          { path: "showtimes", element: <ShowtimeManager /> },
          { path: "bookings", element: <BookingManager /> },
          { path: "prices", element: <TicketPriceManager /> },
          { path: "news", element: <NewsManager /> },
          { path: "festival", element: <FestivalManager /> },
          { path: "promotions", element: <PromotionManager /> },

        ],
      },
    ],
  },
]);
