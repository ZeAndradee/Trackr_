import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/Utils/Layout/Layout.jsx", [
    index("pages/Home/Home.jsx"),
    route("search/:query?", "pages/SearchScreen/SearchScreen.jsx"),

    route("list/create", "pages/List/CreateList/CreateList.jsx", {
      id: "list-create",
    }),
    route(":username/list/:listname", "pages/List/List.jsx"),
    route(":username/list/:listname/edit", "pages/List/CreateList/CreateList.jsx", {
      id: "list-edit",
    }),

    route("track/*", "pages/TrackProfileScreen/TrackProfileScreen.jsx"),
    route("album/*", "pages/AlbumProfileScreen/AlbumProfileScreen.jsx"),
    route("artist/*", "pages/ArtistProfileScreen/ArtistProfileScreen.jsx"),
    route("genre/:slug", "pages/GenreProfileScreen/GenreProfileScreen.jsx"),

    route("friends-reviews", "pages/FriendsReviewsScreen/FriendsReviewsScreen.jsx"),

    route("settings", "pages/Settings/Settings.jsx", [
      index("pages/Settings/tabs/Profile.jsx", { id: "settings-index" }),
      route("profile", "pages/Settings/tabs/Profile.jsx"),
      route("password", "pages/Settings/tabs/Password.jsx"),
      route("email-notifications", "pages/Settings/tabs/EmailNotifications.jsx"),
      route("privacy", "pages/Settings/tabs/PrivacySettings.jsx"),
      route("connections", "pages/Settings/tabs/Connections.jsx"),
      route("security", "pages/Settings/tabs/SecuritySettings.jsx"),
    ]),

    route(":username/log/:logId", "pages/LogPage/LogPage.jsx"),

    route(":username", "pages/ProfileScreen/ProfileScreen.jsx", [
      index("components/User/UserProfile/Overview.jsx"),
      route("reviews", "pages/Reviews/Reviews.jsx"),
      route("lists", "pages/List/Lists/Lists.jsx"),
    ]),

    route("*", "pages/NotFound/CatchAll.jsx"),
  ]),

  route("privacy-policy", "pages/Legal/PrivacyPolicy.jsx"),
  route("terms-of-use", "pages/Legal/TermsOfUse.jsx"),
  route("cookie-policy", "pages/Legal/CookiePolicy.jsx"),
  route("faq", "pages/Legal/FAQ.jsx"),
  route("support", "pages/Legal/Support.jsx"),
  route("spotify/callback", "pages/SpotifyCallback.jsx"),
  route("auth/google/callback", "pages/Auth/GoogleCallback.jsx"),
  route("reset-password", "components/Auth/ResetPassword/ResetPassword.jsx"),
  route("verify-email", "components/Auth/ConfirmEmail/ConfirmEmail.jsx"),
];
