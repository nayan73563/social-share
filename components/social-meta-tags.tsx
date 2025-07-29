import Head from "next/head"

interface SocialMetaTagsProps {
  title: string
  description: string
  image: string
  url: string
  video?: string
  publishedTime?: string
}

export default function SocialMetaTags({ title, description, image, url, video, publishedTime }: SocialMetaTagsProps) {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="viral, trending, social media, entertainment, videos, content" />
      <meta name="author" content="Social Media Hub" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="Social Media Hub" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="og:updated_time" content={publishedTime} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta property="article:author" content="Social Media Hub" />
      <meta property="article:section" content="Entertainment" />
      <meta property="article:tag" content="viral, trending, social media" />

      {/* Video specific Open Graph */}
      {video && (
        <>
          <meta property="og:video" content={video} />
          <meta property="og:video:secure_url" content={video} />
          <meta property="og:video:type" content="video/mp4" />
          <meta property="og:video:width" content="1280" />
          <meta property="og:video:height" content="720" />
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={title} />
      <meta property="twitter:site" content="@SocialMediaHub" />
      <meta property="twitter:creator" content="@SocialMediaHub" />
      <meta property="twitter:domain" content="your-domain.com" />

      {/* WhatsApp */}
      <meta property="og:image:width" content="300" />
      <meta property="og:image:height" content="300" />

      {/* Telegram */}
      <meta name="telegram:channel" content="@socialmediahub" />

      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      <meta name="pinterest" content="nopin" />

      {/* LinkedIn */}
      <meta property="linkedin:owner" content="Social Media Hub" />

      {/* Discord */}
      <meta name="theme-color" content="#1877f2" />

      {/* Mobile App Links */}
      <meta property="al:web:url" content={url} />
      <meta property="al:web:should_fallback" content="true" />

      {/* Additional SEO */}
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preload important resources */}
      <link rel="preload" href={image} as="image" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: description,
            image: [image],
            datePublished: publishedTime,
            dateModified: publishedTime,
            author: {
              "@type": "Organization",
              name: "Social Media Hub",
            },
            publisher: {
              "@type": "Organization",
              name: "Social Media Hub",
              logo: {
                "@type": "ImageObject",
                url: `${url}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
          }),
        }}
      />
    </Head>
  )
}
