import type { ContentPage } from '@/types/cms'

export const seedPages: ContentPage[] = [
  {
    id: 'home',
    name: 'Home',
    status: 'published',
    updatedAt: '2026-07-28T14:20:00.000Z',
    seo: {
      title: 'AMARE — Association Marocaine pour l’Amélioration et la Rénovation de l’Éducation',
      metaDescription:
        'AMARE brings educators, families and institutions together to improve education across Morocco.',
      ogImage: '/images/home-og.jpg',
      slug: '/',
    },
    blocks: [
      {
        id: 'home-hero',
        kind: 'section',
        label: 'Hero section',
        enabled: true,
        heading: 'Shaping the future of education in Morocco',
        paragraph:
          'AMARE unites educators, families and institutions to modernise learning, support teachers and champion every student.',
      },
      {
        id: 'home-hero-cta',
        kind: 'buttons',
        label: 'Hero buttons',
        enabled: true,
        buttons: [
          { id: 'home-cta-1', label: 'Become a member', href: '/membership' },
          { id: 'home-cta-2', label: 'Explore activities', href: '/activities' },
        ],
      },
      {
        id: 'home-welcome',
        kind: 'heading',
        label: 'Welcome heading',
        enabled: true,
        heading: 'Welcome to AMARE',
      },
      {
        id: 'home-welcome-text',
        kind: 'paragraph',
        label: 'Welcome paragraph',
        enabled: true,
        paragraph:
          'For over a decade we have worked alongside regional branches to improve schools, train teachers and give every child a fair chance to succeed.',
      },
      {
        id: 'home-image',
        kind: 'image',
        label: 'Classroom image',
        enabled: true,
        imageUrl: '/images/home-classroom.jpg',
        imageAlt: 'Students collaborating in a modern classroom',
      },
    ],
  },
  {
    id: 'about',
    name: 'About',
    status: 'published',
    updatedAt: '2026-07-21T09:12:00.000Z',
    seo: {
      title: 'About AMARE — Our mission, vision and history',
      metaDescription:
        'Learn about AMARE: our mission, vision, history and the team behind the association.',
      ogImage: '/images/about-og.jpg',
      slug: '/about',
    },
    blocks: [
      {
        id: 'about-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'About AMARE',
      },
      {
        id: 'about-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'The Moroccan Association for the Improvement and Renovation of Education was founded to drive lasting change in the classroom and beyond.',
      },
      {
        id: 'about-mission',
        kind: 'heading',
        label: 'Mission heading',
        enabled: true,
        heading: 'Our mission',
      },
      {
        id: 'about-mission-text',
        kind: 'paragraph',
        label: 'Mission paragraph',
        enabled: true,
        paragraph:
          'We empower teachers with training, equip schools with modern resources and connect communities around a shared vision of quality education for all.',
      },
      {
        id: 'about-image',
        kind: 'image',
        label: 'Team image',
        enabled: true,
        imageUrl: '/images/about-team.jpg',
        imageAlt: 'AMARE volunteers at a regional workshop',
      },
      {
        id: 'about-cta',
        kind: 'buttons',
        label: 'Contact buttons',
        enabled: false,
        buttons: [{ id: 'about-cta-1', label: 'Contact us', href: '/contact' }],
      },
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    status: 'draft',
    updatedAt: '2026-07-30T16:45:00.000Z',
    seo: {
      title: 'Activities — Workshops, training and events',
      metaDescription:
        'Discover AMARE workshops, teacher training sessions, conferences and community events.',
      ogImage: '/images/activities-og.jpg',
      slug: '/activities',
    },
    blocks: [
      {
        id: 'activities-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Our activities',
      },
      {
        id: 'activities-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'From teacher training days to national conferences, we run activities that make education better for everyone.',
      },
      {
        id: 'activities-list-title',
        kind: 'heading',
        label: 'List heading',
        enabled: true,
        heading: 'Upcoming events',
      },
      {
        id: 'activities-list',
        kind: 'paragraph',
        label: 'Events paragraph',
        enabled: true,
        paragraph:
          'Annual education conference · Regional teacher workshops · Parent engagement days · Student science fairs.',
      },
      {
        id: 'activities-cta',
        kind: 'buttons',
        label: 'Calendar buttons',
        enabled: true,
        buttons: [
          { id: 'activities-cta-1', label: 'View full calendar', href: '/activities/calendar' },
        ],
      },
    ],
  },
  {
    id: 'news',
    name: 'News',
    status: 'published',
    updatedAt: '2026-08-01T10:05:00.000Z',
    seo: {
      title: 'News — Latest updates from AMARE',
      metaDescription:
        'Read the latest news, reports and announcements from the association and its branches.',
      ogImage: '/images/news-og.jpg',
      slug: '/news',
    },
    blocks: [
      {
        id: 'news-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'News & updates',
      },
      {
        id: 'news-featured-title',
        kind: 'heading',
        label: 'Featured heading',
        enabled: true,
        heading: 'Featured story',
      },
      {
        id: 'news-featured-text',
        kind: 'paragraph',
        label: 'Featured paragraph',
        enabled: true,
        paragraph:
          'The Annual Report 2025 is out — read about the impact our members made across twelve regional branches this year.',
      },
      {
        id: 'news-featured-image',
        kind: 'image',
        label: 'Report cover image',
        enabled: true,
        imageUrl: '/images/news-report.jpg',
        imageAlt: 'AMARE Annual Report 2025 cover',
      },
    ],
  },
  {
    id: 'membership',
    name: 'Membership',
    status: 'published',
    updatedAt: '2026-07-19T11:30:00.000Z',
    seo: {
      title: 'Membership — Join AMARE',
      metaDescription:
        'Become a member of AMARE and support quality education across Morocco. See benefits and how to join.',
      ogImage: '/images/membership-og.jpg',
      slug: '/membership',
    },
    blocks: [
      {
        id: 'membership-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Become a member',
      },
      {
        id: 'membership-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'Membership is open to educators, parents, students and anyone who believes in better education for all.',
      },
      {
        id: 'membership-benefits',
        kind: 'heading',
        label: 'Benefits heading',
        enabled: true,
        heading: 'Member benefits',
      },
      {
        id: 'membership-benefits-text',
        kind: 'paragraph',
        label: 'Benefits paragraph',
        enabled: true,
        paragraph:
          'Access to training, invitations to events, voting rights at the general assembly and a network of 1,200+ engaged members.',
      },
      {
        id: 'membership-cta',
        kind: 'buttons',
        label: 'Join buttons',
        enabled: true,
        buttons: [
          { id: 'membership-cta-1', label: 'Apply online', href: '/membership/apply' },
        ],
      },
    ],
  },
  {
    id: 'branches',
    name: 'Regional Branches',
    status: 'published',
    updatedAt: '2026-07-15T08:50:00.000Z',
    seo: {
      title: 'Regional Branches — Find your local AMARE branch',
      metaDescription:
        'Find the AMARE regional branch nearest you across Morocco and get involved locally.',
      ogImage: '/images/branches-og.jpg',
      slug: '/branches',
    },
    blocks: [
      {
        id: 'branches-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Regional branches',
      },
      {
        id: 'branches-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'Our work happens where it matters most. Twelve branches organise local events and projects across the kingdom.',
      },
      {
        id: 'branches-cta',
        kind: 'buttons',
        label: 'Branches buttons',
        enabled: true,
        buttons: [{ id: 'branches-cta-1', label: 'Find your branch', href: '/branches/find' }],
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    status: 'draft',
    updatedAt: '2026-07-25T13:40:00.000Z',
    seo: {
      title: 'Contact — Get in touch with AMARE',
      metaDescription:
        'Contact AMARE by email, phone or at our head office. We are happy to answer your questions.',
      ogImage: '/images/contact-og.jpg',
      slug: '/contact',
    },
    blocks: [
      {
        id: 'contact-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Contact us',
      },
      {
        id: 'contact-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'Questions about membership, partnerships or our programmes? We would love to hear from you.',
      },
      {
        id: 'contact-cta',
        kind: 'buttons',
        label: 'Contact buttons',
        enabled: true,
        buttons: [{ id: 'contact-cta-1', label: 'Send a message', href: 'mailto:contact@amare.ma' }],
      },
    ],
  },
  {
    id: 'partners',
    name: 'Partners',
    status: 'draft',
    updatedAt: '2026-07-22T17:15:00.000Z',
    seo: {
      title: 'Partners — Organisations working with AMARE',
      metaDescription:
        'Meet the organisations, schools and companies that partner with AMARE to improve education.',
      ogImage: '/images/partners-og.jpg',
      slug: '/partners',
    },
    blocks: [
      {
        id: 'partners-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Our partners',
      },
      {
        id: 'partners-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'We work with schools, universities, foundations and companies who share our commitment to education.',
      },
      {
        id: 'partners-cta',
        kind: 'buttons',
        label: 'Partnership buttons',
        enabled: true,
        buttons: [{ id: 'partners-cta-1', label: 'Become a partner', href: '/partners/apply' }],
      },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    status: 'published',
    updatedAt: '2026-07-18T12:00:00.000Z',
    seo: {
      title: 'Support — Help us improve education',
      metaDescription:
        'Support AMARE with a donation, your time or by spreading the word. Every contribution counts.',
      ogImage: '/images/support-og.jpg',
      slug: '/support',
    },
    blocks: [
      {
        id: 'support-title',
        kind: 'heading',
        label: 'Page heading',
        enabled: true,
        heading: 'Support our mission',
      },
      {
        id: 'support-intro',
        kind: 'paragraph',
        label: 'Intro paragraph',
        enabled: true,
        paragraph:
          'Your support helps us train more teachers, equip more classrooms and reach more students every year.',
      },
      {
        id: 'support-cta',
        kind: 'buttons',
        label: 'Donate buttons',
        enabled: true,
        buttons: [{ id: 'support-cta-1', label: 'Donate now', href: '/support/donate' }],
      },
    ],
  },
]
