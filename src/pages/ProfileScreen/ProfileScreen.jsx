import { useLoaderData } from "react-router";
import { loaderFetch } from "../../services/ssrLoader";
import { buildMeta, personLd } from "../../services/seo";
import UserProfile from "../../components/User/UserProfile/UserProfile";

export async function loader({ params, request }) {
  const { username } = params;
  if (!username) {
    throw new Response("User not found", { status: 404 });
  }

  const user = await loaderFetch(
    `/profile?username=${encodeURIComponent(username)}&timezoneOffset=0`,
    request
  );

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user };
}

export function meta({ data, params }) {
  const user = data?.user;
  if (!user) return buildMeta({ title: "Profile • Trackr", noindex: true });

  const name = user.displayName || user.username;
  const canonical = `/${user.username}`;

  return buildMeta({
    title: `${name} (@${user.username}) — Music Reviews & Lists | Trackr`,
    description:
      user.bio ||
      `${name}'s music profile on Trackr — ratings, reviews, favorite tracks and playlists.`,
    canonical,
    type: "profile",
    image: user.userimage || user.image || user.userImage || "",
    imageAlt: `${name}'s avatar`,
    jsonLd: personLd(user, { canonical }),
  });
}

const ProfileScreen = () => {
  const { user } = useLoaderData();
  return <UserProfile key={user.username} initialUser={user} />;
};

export default ProfileScreen;
