import { hashSync } from "bcrypt-ts-edge";

const sampleData = {
  users: [
    {
      name: "DhitanAdmin",
      email: "admin@admin.com",
      password: hashSync("Dhitanimam05", 10),
      role: "admin",
    },
    {
      name: "DhitanUser",
      email: "user@user.com",
      password: hashSync("Dhitanimam05", 10),
      role: "user",
    },
  ],
  products: [
    {
      name: "TWICE - THIS IS FOR Album",
      slug: "twice-this-is-for-album",
      category: "Album",
      description: "The latest album from TWICE, THIS IS FOR.",
      images: [
        "/images/sample-products/twice-thisisfor-1.jpg",
        "/images/sample-products/twice-thisisfor-2.jpeg",
      ],
      groupName: "TWICE",
      company: "JYP Entertainment",
      rating: 4.9,
      numReviews: 152,
      isFeatured: true,
      banner: "banner-twice.png",
      variants: {
        create: [
          {
            variantType: "THIS Ver.",
            price: 350000,
            stock: 50,
            images: ["/images/sample-products/twice-thisver.jpg"],
          },
          {
            variantType: "IS Ver.",
            price: 350000,
            stock: 45,
            images: ["/images/sample-products/twice-isver.jpg"],
          },
          {
            variantType: "FOR Ver.",
            price: 365000,
            stock: 20,
            images: ["/images/sample-products/twice-forver.jpg"],
          },
        ],
      },
    },
    {
      name: "TripleS - ASSEMBLE25 Album",
      slug: "triples-assemble25-album",
      category: "Album",
      description: "The full 24-member debut album from TripleS.",
      images: [
        "/images/sample-products/triples-assemble25-1.jpg",
        "/images/sample-products/triples-assemble25-2.jpg",
      ],
      groupName: "TripleS",
      company: "MODHAUS",
      rating: 4.8,
      numReviews: 95,
      isFeatured: true,
      banner: "banner-triples.png",
      variants: {
        create: [
          {
            variantType: "Are You Alive Ver.",
            price: 300000,
            stock: 80,
            images: ["/images/sample-products/triples-areyoualive.jpg"],
          },
          {
            variantType: "We So Alive Ver.",
            price: 300000,
            stock: 75,
            images: ["/images/sample-products/triples-wesoalive.jpg"],
          },
        ],
      },
    },
    {
      name: "SEVENTEEN - HAPPY BURSTDAY Album",
      slug: "seventeen-happy-burstday-album",
      category: "Album",
      description: "Special anniversary album release from SEVENTEEN.",
      images: [
        "/images/sample-products/svt-burstday-1.jpg",
        "/images/sample-products/svt-burstday-2.jpg",
      ],
      groupName: "SEVENTEEN",
      company: "PLEDIS Entertainment",
      rating: 4.9,
      numReviews: 210,
      isFeatured: false,
      banner: null,
      variants: {
        create: [
          {
            variantType: "Daredevil Ver.",
            price: 450000,
            stock: 0,
            images: ["/images/sample-products/svt-burstday-1.jpg"],
          },
        ],
      },
    },
    {
      name: "Seeun Official Photocard - STAYC Metamorphic",
      slug: "pc-seeun-stayc-metamorphic",
      category: "Photocard",
      description: "Official Photocard From STAYC's 1st Album Metamorphic.",
      images: ["/images/sample-products/pc-seeun-metamorphic.jpg"],
      groupName: "STAYC",
      company: "High Up Entertainment",
      rating: 5.0,
      numReviews: 25,
      isFeatured: false,
      banner: null,
      variants: {
        create: [
          {
            variantType: "Album Pull",
            price: 89000,
            stock: 5,
            images: ["/images/sample-products/pc-seeun-metamorphic.jpg"],
          },
        ],
      },
    },
    {
      name: "Jeongyeon Official Photocard - TWICE Strategy",
      slug: "pc-jeongyeon-twice-strategy",
      category: "Photocard",
      description:
        "Official photocard of Jeongyeon from TWICE's 'Strategy' album era.",
      images: ["/images/sample-products/pc-jeongyeon-strategy.jpeg"],
      groupName: "TWICE",
      company: "JYP Entertainment",
      rating: 4.8,
      numReviews: 30,
      isFeatured: true,
      banner: null,
      variants: {
        create: [
          {
            variantType: "Official",
            price: 79000,
            stock: 3,
            images: ["/images/sample-products/pc-jeongyeon-strategy.jpeg"],
          },
        ],
      },
    },
  ],
};

export default sampleData;
