import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { SOCIAL_ITEMS } from "./footerConstants";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="flex flex-col items-center justify-between bg-secondary px-6 py-10 text-center lg:flex-row lg:text-left xl:p-20">
      <div className="mb-4 flex flex-col gap-4 lg:mb-0">
        <div>
          <h4 className="text-lg text-secondary-foreground">
            Customer Service
          </h4>
          <p className="text-muted-foreground">
            <Link href="mailto:dhitanimam05@gmail.com">
              dhitanimam05@gmail.com
            </Link>{" "}
            | <Link href="tel:+6281316856658">+62 81316856658</Link> |{" "}
          </p>
        </div>
        <div>
          <h4 className="text-lg text-secondary-foreground">Office</h4>
          <p className="text-muted-foreground">
            Jl. Pancoran Barat IVE No.16 Jakarta Selatan
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center justify-between gap-8 text-muted-foreground">
          {SOCIAL_ITEMS.map((item) => (
            <Link
              key={`footer-social-${item.label}`}
              href={item.href}
              className="text-3xl hover:text-secondary-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon}
            </Link>
          ))}
        </div>
        <p className="w-full text-center text-muted-foreground">
          Copyright © {currentYear} {APP_NAME}. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
