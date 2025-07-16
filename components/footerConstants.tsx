import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaSquareXTwitter,
} from "react-icons/fa6";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/event" },
];

const SOCIAL_ITEMS = [
  {
    label: "Instagram",
    href: "https://instagram.com/dhitandhitan",
    icon: <FaInstagram />,
  },
  { label: "X", href: "https://x.com/dhitannnn", icon: <FaSquareXTwitter /> },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@dhitandhitan?_t=ZS-8wkRGFkOzUQ&_r=1",
    icon: <FaTiktok />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@triplescosmos",
    icon: <FaYoutube />,
  },
];

export { NAV_ITEMS, SOCIAL_ITEMS };
